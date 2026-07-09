import axios from "axios";
import { PaymentMethod, PaymentStatus, ReservationStatus } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

async function chargeWithCulqi(token: string | undefined, amountInCents: number, email: string) {
  if (!env.CULQI_PRIVATE_KEY || env.CULQI_PRIVATE_KEY.includes("xxxxxxxx")) {
    return {
      id: `demo_${Date.now()}`,
      outcome: { type: "venta_exitosa", user_message: "Pago demo aprobado" },
      object: "charge"
    };
  }

  if (!token) throw new AppError(422, "Token de Culqi requerido");

  const { data } = await axios.post(
    "https://api.culqi.com/v2/charges",
    {
      amount: amountInCents,
      currency_code: "PEN",
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
      include: { customer: true }
    });
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    if (reservation.status === ReservationStatus.PAGADA) throw new AppError(409, "La reserva ya fue pagada");

    const amount = Number(reservation.totalAmount);
    const amountInCents = Math.round(amount * 100);

    try {
      const culqiResponse = await chargeWithCulqi(token, amountInCents, reservation.customer.email);
      const payment = await prisma.payment.create({
        data: {
          reservationId,
          culqiChargeId: culqiResponse.id,
          paymentMethod: method,
          amount,
          status: PaymentStatus.EXITOSO,
          culqiResponse
        }
      });

      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.PAGADA }
      });

      return payment;
    } catch (error) {
      await prisma.payment.create({
        data: {
          reservationId,
          paymentMethod: method,
          amount,
          status: PaymentStatus.RECHAZADO,
          culqiResponse: JSON.parse(JSON.stringify(error instanceof Error ? { message: error.message } : error))
        }
      });
      await prisma.reservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.RECHAZADA } });
      throw new AppError(402, "Pago rechazado por Culqi");
    }
  },
  async handleWebhook(payload: any) {
    const chargeId = payload?.data?.id ?? payload?.id;
    if (!chargeId) return { received: true };

    const payment = await prisma.payment.findFirst({ where: { culqiChargeId: chargeId } });
    if (payment && payload?.type?.includes("charge")) {
      await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { status: ReservationStatus.PAGADA }
      });
    }

    return { received: true };
  },
  list() {
    return prisma.payment.findMany({ include: { reservation: { include: { customer: true, tour: true } } }, orderBy: { createdAt: "desc" } });
  }
};

