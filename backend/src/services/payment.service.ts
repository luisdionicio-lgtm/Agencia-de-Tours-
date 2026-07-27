import { PaymentAuditAction, PaymentMethod, PaymentStatus, Prisma, ReservationStatus } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { mailService } from "./mail.service";
import { releaseExpiredReservationHolds } from "./reservation.service";
import type { paymentSchema } from "../validators/schemas";
import type { z } from "zod";

const proofSummary = { select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true } } as const;

async function restoreSlots(tx: Prisma.TransactionClient, reservation: { departureId: number | null; tourId: number; peopleCount: number }) {
  if (reservation.departureId) {
    await tx.tourDeparture.update({ where: { id: reservation.departureId }, data: { availableSlots: { increment: reservation.peopleCount } } });
  } else {
    await tx.tour.update({ where: { id: reservation.tourId }, data: { availableSlots: { increment: reservation.peopleCount } } });
  }
}

export const paymentService = {
  async submitYape(input: z.infer<typeof paymentSchema>, file: Express.Multer.File) {
    await releaseExpiredReservationHolds();
    if (Math.abs(input.amount - env.YAPE_RESERVATION_AMOUNT) > 0.01) throw new AppError(422, `El monto de separacion debe ser S/ ${env.YAPE_RESERVATION_AMOUNT}`);
    const reservation = await prisma.reservation.findFirst({ where: { id: input.reservationId, publicToken: input.reservationToken }, include: { tour: true } });
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    if (reservation.status !== ReservationStatus.PENDIENTE || !reservation.slotsHeld) throw new AppError(409, "La reserva ya fue procesada o el bloqueo temporal vencio");
    const existing = await prisma.payment.findFirst({ where: { reservationId: input.reservationId, paymentMethod: PaymentMethod.YAPE, status: PaymentStatus.PENDIENTE } });
    if (existing) throw new AppError(409, "Ya existe un comprobante Yape pendiente de validacion");

    return prisma.payment.create({
      data: {
        reservationId: input.reservationId, externalReference: input.referenceCode,
        paymentMethod: PaymentMethod.YAPE, amount: input.amount, paidAt: input.paidAt,
        currency: "PEN", status: PaymentStatus.PENDIENTE,
        metadata: { source: "manual_yape", submittedAt: new Date().toISOString() },
        proof: { create: { fileName: file.originalname.slice(0, 180), mimeType: file.mimetype, sizeBytes: file.size, data: new Uint8Array(file.buffer) } },
        audits: { create: { action: PaymentAuditAction.SUBMITTED, details: { amount: input.amount, referenceCode: input.referenceCode, paidAt: input.paidAt.toISOString() } } }
      },
      include: { proof: proofSummary, audits: true }
    });
  },

  async confirmYape(paymentId: number, actorId: number) {
    await releaseExpiredReservationHolds();
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { reservation: true, proof: true } });
      if (!payment || payment.paymentMethod !== PaymentMethod.YAPE) throw new AppError(404, "Pago Yape no encontrado");
      if (!payment.proof) throw new AppError(409, "No existe un comprobante adjunto");
      if (payment.status !== PaymentStatus.PENDIENTE) throw new AppError(409, "El pago ya fue procesado");
      if (!payment.reservation.slotsHeld || !payment.reservation.holdExpiresAt || payment.reservation.holdExpiresAt <= new Date()) throw new AppError(409, "El bloqueo temporal del cupo vencio");

      const reserved = await tx.reservation.updateMany({
        where: { id: payment.reservationId, status: ReservationStatus.PENDIENTE, slotsHeld: true },
        data: { status: ReservationStatus.PAGADA, slotsHeld: false, holdExpiresAt: null }
      });
      if (reserved.count !== 1) throw new AppError(409, "La reserva ya fue procesada");

      const now = new Date();
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.EXITOSO, validatedAt: now, validatedById: actorId, metadata: { source: "manual_yape", validatedAt: now.toISOString() } }
      });
      await tx.paymentAudit.create({ data: { paymentId, action: PaymentAuditAction.APPROVED, actorId, details: { validatedAt: now.toISOString() } } });
      return tx.reservation.findUnique({ where: { id: updated.reservationId }, include: { customer: true, tour: true, departure: true, payments: { include: { proof: proofSummary, audits: { include: { actor: { select: { name: true, email: true } } } }, validatedBy: { select: { name: true, email: true } } } } } });
    });
    if (result) void mailService.sendPaymentConfirmed(result).catch((error) => console.error("No se pudo enviar el correo de pago confirmado", error));
    return result;
  },

  async rejectYape(paymentId: number, actorId: number) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId }, include: { reservation: true } });
      if (!payment || payment.paymentMethod !== PaymentMethod.YAPE) throw new AppError(404, "Pago Yape no encontrado");
      if (payment.status !== PaymentStatus.PENDIENTE) throw new AppError(409, "El pago ya fue procesado");
      const now = new Date();
      await tx.payment.update({ where: { id: paymentId }, data: { status: PaymentStatus.RECHAZADO, validatedAt: now, validatedById: actorId, metadata: { source: "manual_yape", rejectedAt: now.toISOString() } } });
      await tx.paymentAudit.create({ data: { paymentId, action: PaymentAuditAction.REJECTED, actorId, details: { rejectedAt: now.toISOString() } } });
      const rejected = await tx.reservation.updateMany({
        where: { id: payment.reservationId, status: ReservationStatus.PENDIENTE },
        data: { status: ReservationStatus.RECHAZADA, slotsHeld: false, holdExpiresAt: null }
      });
      if (rejected.count === 1 && payment.reservation.slotsHeld) await restoreSlots(tx, payment.reservation);
      return { status: "RECHAZADO" };
    });
  },

  async list() {
    await releaseExpiredReservationHolds();
    return prisma.payment.findMany({
      include: {
        reservation: { include: { customer: true, tour: true, departure: true } },
        proof: proofSummary,
        validatedBy: { select: { name: true, email: true } },
        audits: { include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } }
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async proof(paymentId: number) {
    const proof = await prisma.paymentProof.findUnique({ where: { paymentId } });
    if (!proof) throw new AppError(404, "Comprobante no encontrado");
    return proof;
  }
};
