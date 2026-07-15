import axios from "axios";
import { PaymentMethod, PaymentStatus, ReservationStatus } from "@prisma/client";
import crypto from "crypto";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { mailService } from "./mail.service";
import { AppError } from "../utils/AppError";

async function chargeWithCulqi(token: string | undefined, amountInCents: number, email: string, currency: "PEN" | "USD") {
  const canUseDemoPayments = env.NODE_ENV === "development" && env.ALLOW_DEMO_PAYMENTS;

  if (!env.CULQI_PRIVATE_KEY || env.CULQI_PRIVATE_KEY.includes("xxxxxxxx")) {
    if (!canUseDemoPayments) {
      throw new AppError(503, "Culqi no esta configurado. Define CULQI_PRIVATE_KEY real o habilita ALLOW_DEMO_PAYMENTS=true solo en desarrollo.");
    }
    return {
      id: `demo_${Date.now()}`,
      outcome: { type: "venta_exitosa", user_message: "Pago demo aprobado" },
      object: "charge"
    };
  }

  if (!token) throw new AppError(422, "Token de Culqi requerido");

  const { data } = await axios.post(
    `${env.CULQI_API_URL.replace(/\/$/, "")}/charges`,
    {
      amount: amountInCents,
      currency_code: currency,
      email,
      source_id: token
    },
    { headers: { Authorization: `Bearer ${env.CULQI_PRIVATE_KEY}` } }
  );

  return data;
}

export const paymentService = {
  async pay(reservationId: number, method: PaymentMethod, token?: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { customer: true, tour: true, departure: true }
    });
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    if (reservation.status === ReservationStatus.PAGADA) throw new AppError(409, "La reserva ya fue pagada");
    const availableSlots = reservation.departure?.availableSlots ?? reservation.tour.availableSlots;
    if (availableSlots < reservation.peopleCount) throw new AppError(409, "No hay cupos suficientes para procesar el pago");

    const amount = reservation.tour.paymentMode === "DEPOSIT"
      ? Number(reservation.totalAmount) * Number(reservation.tour.depositPercent ?? 100) / 100
      : Number(reservation.totalAmount);
    const amountInCents = Math.round(amount * 100);

    try {
      const culqiResponse = await chargeWithCulqi(token, amountInCents, reservation.customer.email, reservation.tour.currency);
      const payment = await prisma.$transaction(async (tx) => {
        const currentReservation = await tx.reservation.findUnique({
          where: { id: reservationId },
          include: { tour: true }
        });
        if (!currentReservation) throw new AppError(404, "Reserva no encontrada");
        if (currentReservation.status === ReservationStatus.PAGADA) throw new AppError(409, "La reserva ya fue pagada");

        const updatedSlots = currentReservation.departureId
          ? await tx.tourDeparture.updateMany({
              where: { id: currentReservation.departureId, availableSlots: { gte: currentReservation.peopleCount } },
              data: { availableSlots: { decrement: currentReservation.peopleCount } }
            })
          : await tx.tour.updateMany({
              where: { id: currentReservation.tourId, availableSlots: { gte: currentReservation.peopleCount } },
              data: { availableSlots: { decrement: currentReservation.peopleCount } }
            });
        if (updatedSlots.count !== 1) throw new AppError(409, "No hay cupos suficientes para confirmar el pago");

        const createdPayment = await tx.payment.create({
          data: {
            reservationId,
            culqiChargeId: culqiResponse.id,
            paymentMethod: method,
            amount,
            currency: reservation.tour.currency,
            status: PaymentStatus.EXITOSO,
            culqiResponse
          }
        });

        const updatedReservation = await tx.reservation.updateMany({
          where: { id: reservationId, status: { not: ReservationStatus.PAGADA } },
          data: { status: ReservationStatus.PAGADA }
        });
        if (updatedReservation.count !== 1) throw new AppError(409, "La reserva ya fue procesada");

        return createdPayment;
      });

      const paidReservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { customer: true, tour: true }
      });
      if (paidReservation) {
        void mailService.sendPaymentConfirmed(paidReservation).catch((error) => {
          console.error("No se pudo enviar el correo de pago confirmado", error);
        });
      }

      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;

      await prisma.payment.create({
        data: {
          reservationId,
          paymentMethod: method,
          amount,
          currency: reservation.tour.currency,
          status: PaymentStatus.RECHAZADO,
          culqiResponse: JSON.parse(JSON.stringify(error instanceof Error ? { message: error.message } : error))
        }
      });
      await prisma.reservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.RECHAZADA } });
      throw new AppError(402, "Pago rechazado por Culqi");
    }
  },
  verifyWebhookSignature(rawBody: string, signature: string | string[] | undefined) {
    if (!env.CULQI_WEBHOOK_SECRET || env.CULQI_WEBHOOK_SECRET.includes("change_this")) return;
    const receivedSignature = Array.isArray(signature) ? signature[0] : signature;
    if (!receivedSignature) throw new AppError(401, "Firma de webhook Culqi requerida");

    const expectedSignature = crypto.createHmac("sha256", env.CULQI_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const received = Buffer.from(receivedSignature.replace(/^sha256=/, ""), "hex");
    const expected = Buffer.from(expectedSignature, "hex");
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      throw new AppError(401, "Firma de webhook Culqi invalida");
    }
  },
  async handleWebhook(payload: any) {
    const chargeId = payload?.data?.id ?? payload?.id;
    if (!chargeId) return { received: true };

    const payment = await prisma.payment.findFirst({ where: { culqiChargeId: chargeId } });
    if (payment && payload?.type?.includes("charge")) {
      const reservation = await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { status: ReservationStatus.PAGADA },
        include: { customer: true, tour: true }
      });
      void mailService.sendPaymentConfirmed(reservation).catch((error) => {
        console.error("No se pudo enviar el correo de pago confirmado por webhook", error);
      });
    }

    return { received: true };
  },
  list() {
    return prisma.payment.findMany({ include: { reservation: { include: { customer: true, tour: true } } }, orderBy: { createdAt: "desc" } });
  }
};
