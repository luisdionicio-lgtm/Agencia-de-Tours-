import { PaymentMethod, PaymentStatus, ReservationStatus } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { mailService } from "./mail.service";

export const paymentService = {
  async submitYape(reservationId: number, reservationToken: string, referenceCode: string) {
    const reservation = await prisma.reservation.findFirst({
      where: { id: reservationId, publicToken: reservationToken },
      include: { tour: true }
    });
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    if (reservation.status !== ReservationStatus.PENDIENTE) {
      throw new AppError(409, "La reserva ya fue procesada");
    }

    const existing = await prisma.payment.findFirst({
      where: { reservationId, paymentMethod: PaymentMethod.YAPE, status: PaymentStatus.PENDIENTE }
    });
    if (existing) throw new AppError(409, "Ya existe un comprobante Yape pendiente de validación");

    return prisma.payment.create({
      data: {
        reservationId,
        externalReference: referenceCode,
        paymentMethod: PaymentMethod.YAPE,
        amount: env.YAPE_RESERVATION_AMOUNT,
        currency: "PEN",
        status: PaymentStatus.PENDIENTE,
        metadata: { source: "manual_yape", submittedAt: new Date().toISOString() }
      }
    });
  },

  async confirmYape(paymentId: number) {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { reservation: true }
      });
      if (!payment || payment.paymentMethod !== PaymentMethod.YAPE) throw new AppError(404, "Pago Yape no encontrado");
      if (payment.status === PaymentStatus.EXITOSO) throw new AppError(409, "El pago ya fue confirmado");
      if (payment.status !== PaymentStatus.PENDIENTE) throw new AppError(409, "El pago ya fue procesado");

      const reserved = await tx.reservation.updateMany({
        where: { id: payment.reservationId, status: ReservationStatus.PENDIENTE },
        data: { status: ReservationStatus.PAGADA }
      });
      if (reserved.count !== 1) throw new AppError(409, "La reserva ya fue procesada");

      const updatedSlots = payment.reservation.departureId
        ? await tx.tourDeparture.updateMany({
            where: { id: payment.reservation.departureId, availableSlots: { gte: payment.reservation.peopleCount } },
            data: { availableSlots: { decrement: payment.reservation.peopleCount } }
          })
        : await tx.tour.updateMany({
            where: { id: payment.reservation.tourId, availableSlots: { gte: payment.reservation.peopleCount } },
            data: { availableSlots: { decrement: payment.reservation.peopleCount } }
          });
      if (updatedSlots.count !== 1) throw new AppError(409, "No hay cupos suficientes para confirmar la reserva");

      const updatedPayment = await tx.payment.updateMany({
        where: { id: paymentId, status: PaymentStatus.PENDIENTE },
        data: {
          status: PaymentStatus.EXITOSO,
          metadata: { source: "manual_yape", validatedAt: new Date().toISOString() }
        }
      });
      if (updatedPayment.count !== 1) throw new AppError(409, "El pago ya fue procesado");

      return tx.reservation.findUnique({
        where: { id: payment.reservationId },
        include: { customer: true, tour: true, payments: true }
      });
    });

    if (result) {
      void mailService.sendPaymentConfirmed(result).catch((error) => {
        console.error("No se pudo enviar el correo de pago confirmado", error);
      });
    }
    return result;
  },

  async rejectYape(paymentId: number) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.paymentMethod !== PaymentMethod.YAPE) throw new AppError(404, "Pago Yape no encontrado");
      if (payment.status !== PaymentStatus.PENDIENTE) throw new AppError(409, "El pago ya fue procesado");

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.RECHAZADO,
          metadata: { source: "manual_yape", rejectedAt: new Date().toISOString() }
        }
      });
      await tx.reservation.updateMany({
        where: { id: payment.reservationId, status: ReservationStatus.PENDIENTE },
        data: { status: ReservationStatus.RECHAZADA }
      });
      return { status: "RECHAZADO" };
    });
  },

  list() {
    return prisma.payment.findMany({
      include: { reservation: { include: { customer: true, tour: true } } },
      orderBy: { createdAt: "desc" }
    });
  }
};
