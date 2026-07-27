import { ReservationStatus, TourStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { mailService } from "./mail.service";
import { AppError } from "../utils/AppError";
import type { reservationSchema } from "../validators/schemas";
import type { z } from "zod";

export const reservationService = {
  async create(input: z.infer<typeof reservationSchema>) {
    const tour = await prisma.tour.findUnique({ where: { id: input.tourId } });
    if (!tour || tour.status !== TourStatus.ACTIVO) throw new AppError(404, "Tour no disponible");
    const departure = input.departureId ? await prisma.tourDeparture.findFirst({ where: { id: input.departureId, tourId: tour.id, status: TourStatus.ACTIVO } }) : null;
    if (input.departureId && !departure) throw new AppError(404, "Salida no disponible");
    if ((departure?.availableSlots ?? tour.availableSlots) < input.peopleCount) throw new AppError(409, "No hay cupos suficientes");

    const totalAmount = Number(tour.price) * input.peopleCount;

    const reservation = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          documentNumber: input.documentNumber
        }
      });

      const reservation = await tx.reservation.create({
        data: {
          customerId: customer.id,
          tourId: tour.id,
          departureId: departure?.id,
          travelDate: departure?.startDate ?? input.travelDate,
          peopleCount: input.peopleCount,
          totalAmount,
          status: ReservationStatus.PENDIENTE
        },
        include: { customer: true, tour: true }
      });

      return reservation;
    });

    void mailService.sendReservationCreated(reservation).catch((error) => {
      console.error("No se pudo enviar el correo de reserva", error);
    });

    return reservation;
  },
  list() {
    return prisma.reservation.findMany({
      include: { customer: true, tour: true, payments: true },
      orderBy: { createdAt: "desc" }
    });
  },
  async get(id: number) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { customer: true, tour: true, payments: true }
    });
    if (!reservation) throw new AppError(404, "Reserva no encontrada");
    return reservation;
  },
  async cancel(id: number) {
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id } });
      if (!reservation) throw new AppError(404, "Reserva no encontrada");
      if (reservation.status === ReservationStatus.CANCELADA) throw new AppError(409, "La reserva ya fue cancelada");

      const cancelled = await tx.reservation.updateMany({
        where: { id, status: reservation.status },
        data: { status: ReservationStatus.CANCELADA }
      });
      if (cancelled.count !== 1) throw new AppError(409, "La reserva ya fue procesada");

      if (reservation.status === ReservationStatus.PAGADA) {
        if (reservation.departureId) {
          await tx.tourDeparture.update({
            where: { id: reservation.departureId },
            data: { availableSlots: { increment: reservation.peopleCount } }
          });
        } else {
          await tx.tour.update({
            where: { id: reservation.tourId },
            data: { availableSlots: { increment: reservation.peopleCount } }
          });
        }
      }

      return tx.reservation.findUnique({
        where: { id },
        include: { customer: true, tour: true, payments: true }
      });
    });
  }
};
