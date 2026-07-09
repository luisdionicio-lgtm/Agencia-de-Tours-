import { ReservationStatus, TourStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import type { reservationSchema } from "../validators/schemas";
import type { z } from "zod";

export const reservationService = {
  async create(input: z.infer<typeof reservationSchema>) {
    const tour = await prisma.tour.findUnique({ where: { id: input.tourId } });
    if (!tour || tour.status !== TourStatus.ACTIVO) throw new AppError(404, "Tour no disponible");
    if (tour.availableSlots < input.peopleCount) throw new AppError(409, "No hay cupos suficientes");

    const totalAmount = Number(tour.price) * input.peopleCount;

    return prisma.$transaction(async (tx) => {
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
          travelDate: input.travelDate,
          peopleCount: input.peopleCount,
          totalAmount,
          status: ReservationStatus.PENDIENTE
        },
        include: { customer: true, tour: true }
      });

      await tx.tour.update({
        where: { id: tour.id },
        data: { availableSlots: { decrement: input.peopleCount } }
      });

      return reservation;
    });
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
  }
};

