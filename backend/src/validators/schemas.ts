import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(6).max(128)
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const boundedText = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum);
const optionalBoundedText = (maximum: number) => z.string().trim().max(maximum).optional().nullable();

export const tourSchema = z.object({
  categoryId: z.coerce.number().optional().nullable(),
  title: boundedText(3, 150),
  slug: z.string().min(3).max(160).optional(),
  destination: boundedText(2, 120),
  description: optionalBoundedText(5000),
  price: z.coerce.number().positive(),
  currency: z.enum(["PEN", "USD"]).default("PEN"),
  paymentMode: z.enum(["FULL", "DEPOSIT"]).default("FULL"),
  depositPercent: z.coerce.number().int().min(1).max(100).optional().nullable(),
  duration: optionalBoundedText(80),
  type: z.enum(["NACIONAL", "INTERNACIONAL"]),
  availableSlots: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().url().optional().nullable(),
  imageCredit: z.string().max(255).optional().nullable(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  itinerary: z.array(boundedText(1, 500)).max(30).optional(),
  includes: z.array(boundedText(1, 300)).max(30).optional(),
  excludes: z.array(boundedText(1, 300)).max(30).optional()
}).superRefine((data, context) => {
  if (data.paymentMode === "DEPOSIT" && !data.depositPercent) context.addIssue({ code: "custom", path: ["depositPercent"], message: "Indica el porcentaje del adelanto" });
});

export const departureSchema = z.object({
  startDate: z.coerce.date(), endDate: z.coerce.date().optional().nullable(),
  capacity: z.coerce.number().int().positive(), status: z.enum(["ACTIVO", "INACTIVO"]).default("ACTIVO")
}).refine((data) => !data.endDate || data.endDate >= data.startDate, { path: ["endDate"], message: "Fecha final invalida" });

export const businessSettingsSchema = z.object({
  legalName: z.string().max(180).optional().nullable(), tradeName: z.string().min(2).max(120),
  taxId: z.string().max(30).optional().nullable(), address: z.string().max(255).optional().nullable(),
  supportEmail: z.string().email().optional().nullable(), whatsappNumber: z.string().max(30).optional().nullable(),
  domain: z.string().url().optional().nullable(), cancellationPolicy: z.string().optional().nullable(),
  refundPolicy: z.string().optional().nullable(), terms: z.string().optional().nullable(),
  privacyPolicy: z.string().optional().nullable(), cookiePolicy: z.string().optional().nullable(),
  complaintsBookUrl: z.string().url().optional().nullable(), policiesPublished: z.boolean().default(false)
}).superRefine((data, context) => {
  if (!data.policiesPublished) return;
  const required = ["legalName", "taxId", "address", "supportEmail", "cancellationPolicy", "refundPolicy", "terms", "privacyPolicy", "cookiePolicy"] as const;
  required.forEach((field) => { if (!data[field]) context.addIssue({ code: "custom", path: [field], message: "Obligatorio para publicar" }); });
});

export const testimonialSchema = z.object({
  name: boundedText(2, 120), location: optionalBoundedText(120),
  comment: boundedText(10, 1000), rating: z.coerce.number().int().min(1).max(5),
  avatarUrl: z.string().url().optional().nullable(), source: z.string().max(255).optional().nullable(),
  verified: z.boolean().default(false), published: z.boolean().default(false)
}).refine((data) => !data.published || data.verified, { path: ["published"], message: "Solo se publican testimonios verificados" });

export const reservationSchema = z.object({
  tourId: z.coerce.number().int().positive(),
  departureId: z.coerce.number().int().positive().optional(),
  fullName: boundedText(3, 120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(30).optional(),
  documentNumber: z.string().trim().max(30).optional(),
  travelDate: z.coerce.date(),
  peopleCount: z.coerce.number().int().min(1).max(20)
});

export const paymentSchema = z.object({
  reservationId: z.coerce.number().int().positive(),
  reservationToken: z.string().uuid(),
  referenceCode: boundedText(6, 80),
  amount: z.coerce.number().positive().max(100000),
  paidAt: z.coerce.date().refine((date) => date <= new Date(), "La fecha de pago no puede estar en el futuro")
});

export const contactSchema = z.object({
  fullName: boundedText(3, 120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(30).optional(),
  message: boundedText(10, 3000)
});
