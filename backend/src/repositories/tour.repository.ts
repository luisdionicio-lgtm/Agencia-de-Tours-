import slugify from "slugify";
import { Prisma, TourStatus, TourType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const tourRepository = {
  findAll(filters: { type?: TourType; destination?: string; minPrice?: number; maxPrice?: number }) {
    const where: Prisma.TourWhereInput = {
      status: TourStatus.ACTIVO,
      type: filters.type,
      destination: filters.destination ? { contains: filters.destination } : undefined,
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice
      }
    };

    return prisma.tour.findMany({
      where,
      include: { category: true, images: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
    });
  },
  findById(id: number) {
    return prisma.tour.findUnique({ where: { id }, include: { category: true, images: true } });
  },
  findBySlug(slug: string) {
    return prisma.tour.findUnique({ where: { slug }, include: { category: true, images: true } });
  },
  create(data: Prisma.TourCreateInput & { slug?: string }) {
    const slug = data.slug ?? slugify(data.title, { lower: true, strict: true });
    return prisma.tour.create({ data: { ...data, slug } });
  },
  update(id: number, data: Prisma.TourUpdateInput) {
    return prisma.tour.update({ where: { id }, data });
  },
  delete(id: number) {
    return prisma.tour.update({ where: { id }, data: { status: TourStatus.INACTIVO } });
  }
};

