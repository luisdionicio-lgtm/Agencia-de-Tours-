import { PaymentAuditAction, PaymentStatus, Prisma, ReservationStatus, TourStatus } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { mailService } from "./mail.service";
import type { reservationSchema } from "../validators/schemas";
import type { z } from "zod";

async function restoreSlots(tx: Prisma.TransactionClient, reservation: { departureId: number | null; tourId: number; peopleCount: number }) {
  if (reservation.departureId) {
    await tx.tourDeparture.update({ where: { id: reservation.departureId }, data: { availableSlots: { increment: reservation.peopleCount } } });
  } else {
    await tx.tour.update({ where: { id: reservation.tourId }, data: { availableSlots: { increment: reservation.peopleCount } } });
  }
}

export async function releaseExpiredReservationHolds() {
  const expired = await prisma.reservation.findMany({
    where: { status: ReservationStatus.PENDIENTE, slotsHeld: true, holdExpiresAt: { lte: new Date() } },
    select: { id: true, departureId: true, tourId: true, peopleCount: true }
  });

  for (const reservation of expired) {
    await prisma.$transaction(async (tx) => {
      const released = await tx.reservation.updateMany({
        where: { id: reservation.id, status: ReservationStatus.PENDIENTE, slotsHeld: true, holdExpiresAt: { lte: new Date() } },
        data: { status: ReservationStatus.CANCELADA, slotsHeld: false, holdExpiresAt: null }
      });
      if (released.count !== 1) return;
      await restoreSlots(tx, reservation);
      const payments = await tx.payment.findMany({ where: { reservationId: reservation.id, status: PaymentStatus.PENDIENTE }, select: { id: true } });
      if (payments.length) {
        await tx.payment.updateMany({ where: { id: { in: payments.map(({ id }) => id) } }, data: { status: PaymentStatus.RECHAZADO } });
        await tx.paymentAudit.createMany({
          data: payments.map(({ id }) => ({ paymentId: id, action: PaymentAuditAction.HOLD_EXPIRED, details: { reason: "Tiempo de validacion vencido" } }))
        });
      }
    });
  }
}

export const reservationService = {
  async create(input: z.infer<typeof reservationSchema>) {
    await releaseExpiredReservationHolds();
    const tour = await prisma.tour.findUnique({ where: { id: input.tourId } });
    if (!tour || tour.status !== TourStatus.ACTIVO) throw new AppError(404, "Tour no disponible");
    const departure = input.departureId ? await prisma.tourDeparture.findFirst({ where: { id: input.departureId, tourId: tour.id, status: TourStatus.ACTIVO } }) : null;
    if (input.departureId && !departure) throw new AppError(404, "Salida no disponible");
    const totalAmount = Number(tour.price) * input.peopleCount;
    const holdExpiresAt = new Date(Date.now() + env.RESERVATION_HOLD_MINUTES * 60_000);

    const reservation = await prisma.$transaction(async (tx) => {
      const slots = departure
        ? await tx.tourDeparture.updateMany({ where: { id: departure.id, availableSlots: { gte: input.peopleCount } }, data: { availableSlots: { decrement: input.peopleCount } } })
        : await tx.tour.updateMany({ where: { id: tour.id, availableSlots: { gte: input.peopleCount } }, data: { availableSlots: { decrement: input.peopleCount } } });
      if (slots.count !== 1) throw new AppError(409, "No hay cupos suficientes");

      const customer = await tx.customer.create({
        data: { fullName: input.fullName, email: input.email, phone: input.phone, documentNumber: input.documentNumber }
      });
      return tx.reservation.create({
        data: {
          customerId: customer.id, tourId: tour.id, departureId: departure?.id,
          travelDate: departure?.startDate ?? input.travelDate, peopleCount: input.peopleCount,
          totalAmount, status: ReservationStatus.PENDIENTE, slotsHeld: true, holdExpiresAt
        },
        include: { customer: true, tour: true, departure: true }
      });
    });

    void mailService.sendReservationCreated(reservation).catch((error) => console.error("No se pudo enviar el correo de reserva", error));
    return reservation;
  },
  async list() {
    await releaseExpiredReservationHolds();
    return prisma.reservation.findMany({
      include: { customer: true, tour: true, departure: true, payments: { include: { proof: { select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true } }, audits: { include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } }, validatedBy: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" }
    });
  },
  async get(id: number) {
    await releaseExpiredReservationHolds();
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { customer: true, tour: true, departure: true, payments: { include: { proof: { select: { id: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true } }, audits: { orderBy: { createdAt: "desc" } } } } }
    });
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    return reservation;
  },
  async cancel(id: number, actorId: number) {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id }, include: { payments: { select: { id: true } } } });
      if (!reservation) throw new AppError(404, "Reserva no encontrada");
      if (reservation.status === ReservationStatus.CANCELADA || reservation.status === ReservationStatus.RECHAZADA) throw new AppError(409, "La reserva ya fue procesada");

      const cancelled = await tx.reservation.updateMany({
        where: { id, status: reservation.status },
        data: { status: ReservationStatus.CANCELADA, slotsHeld: false, holdExpiresAt: null }
      });
      if (cancelled.count !== 1) throw new AppError(409, "La reserva ya fue procesada");

      if (reservation.slotsHeld || reservation.status === ReservationStatus.PAGADA) await restoreSlots(tx, reservation);
      if (reservation.payments.length) {
        await tx.payment.updateMany({ where: { id: { in: reservation.payments.map(({ id }) => id) } }, data: { status: PaymentStatus.DEVUELTO } });
        await tx.paymentAudit.createMany({ data: reservation.payments.map(({ id: paymentId }) => ({ paymentId, action: PaymentAuditAction.CANCELLED, actorId })) });
      }
      return tx.reservation.findUnique({ where: { id }, include: { customer: true, tour: true, departure: true, payments: true } });
    });
  }
};
