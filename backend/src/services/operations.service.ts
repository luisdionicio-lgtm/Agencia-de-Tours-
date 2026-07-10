import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import type { businessSettingsSchema, departureSchema, testimonialSchema } from "../validators/schemas";
import type { z } from "zod";

export const operationsService = {
  publicSettings: async () => {
    const settings = await prisma.businessSettings.findUnique({ where: { id: 1 } });
    if (!settings?.policiesPublished) return { tradeName: settings?.tradeName ?? "Jhon Tours", policiesPublished: false };
    return settings;
  },
  adminSettings: () => prisma.businessSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
  saveSettings: (data: z.infer<typeof businessSettingsSchema>) => prisma.businessSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } }),
  async createDeparture(tourId: number, data: z.infer<typeof departureSchema>) {
    if (!await prisma.tour.findUnique({ where: { id: tourId } })) throw new AppError(404, "Tour no encontrado");
    return prisma.tourDeparture.create({ data: { ...data, tourId, availableSlots: data.capacity } });
  },
  listDepartures: (tourId: number) => prisma.tourDeparture.findMany({ where: { tourId }, orderBy: { startDate: "asc" } }),
  createTestimonial: (data: z.infer<typeof testimonialSchema>) => prisma.testimonial.create({ data }),
  updateTestimonial: (id: number, data: z.infer<typeof testimonialSchema>) => prisma.testimonial.update({ where: { id }, data }),
  listTestimonialsAdmin: () => prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } })
};
