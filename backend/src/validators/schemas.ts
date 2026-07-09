import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const tourSchema = z.object({
  categoryId: z.coerce.number().optional().nullable(),
  title: z.string().min(3).max(150),
  slug: z.string().min(3).max(160).optional(),
  destination: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive(),
  duration: z.string().optional().nullable(),
  type: z.enum(["NACIONAL", "INTERNACIONAL"]),
  availableSlots: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  itinerary: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional()
});

export const reservationSchema = z.object({
  tourId: z.coerce.number().int().positive(),
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  documentNumber: z.string().max(30).optional(),
  travelDate: z.coerce.date(),
  peopleCount: z.coerce.number().int().min(1).max(20)
});

export const paymentSchema = z.object({
  reservationId: z.coerce.number().int().positive(),
  token: z.string().min(6).optional()
});

export const contactSchema = z.object({
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  message: z.string().min(10)
});

