import { TourType } from "@prisma/client";
import { tourRepository } from "../repositories/tour.repository";
import { AppError } from "../utils/AppError";
import type { tourSchema } from "../validators/schemas";
import type { z } from "zod";

export const tourService = {
  list(query: Record<string, unknown>) {
    return tourRepository.findAll({
      type: query.type as TourType | undefined,
      destination: query.destination as string | undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined
    });
  },
  async get(idOrSlug: string) {
    const tour = Number.isNaN(Number(idOrSlug))
      ? await tourRepository.findBySlug(idOrSlug)
      : await tourRepository.findById(Number(idOrSlug));
    if (!tour) throw new AppError(404, "Tour no encontrado");
    return tour;
  },
  create(data: z.infer<typeof tourSchema>) {
    return tourRepository.create(data as never);
  },
  update(id: number, data: z.infer<typeof tourSchema>) {
    return tourRepository.update(id, data as never);
  },
  remove(id: number) {
    return tourRepository.delete(id);
  }
};

