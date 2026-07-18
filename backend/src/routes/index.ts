import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { contactController } from "../controllers/contact.controller";
import { paymentController } from "../controllers/payment.controller";
import { reservationController } from "../controllers/reservation.controller";
import { tourController } from "../controllers/tour.controller";
import { operationsController } from "../controllers/operations.controller";
import { getIntegrationStatus } from "../config/env";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { businessSettingsSchema, contactSchema, departureSchema, loginSchema, paymentSchema, reservationSchema, testimonialSchema, tourSchema } from "../validators/schemas";

export const routes = Router();

routes.get("/health", (_req, res) => res.json({ status: "ok", service: "John Tours API" }));
routes.get("/health/integrations", (_req, res) => res.json(getIntegrationStatus()));

routes.post("/auth/login", validate(loginSchema), asyncHandler(authController.login));

routes.get("/tours", asyncHandler(tourController.list));
routes.get("/tours/:id", asyncHandler(tourController.get));
routes.post("/tours", requireAdmin, validate(tourSchema), asyncHandler(tourController.create));
routes.put("/tours/:id", requireAdmin, validate(tourSchema), asyncHandler(tourController.update));
routes.delete("/tours/:id", requireAdmin, asyncHandler(tourController.remove));

routes.post("/reservations", validate(reservationSchema), asyncHandler(reservationController.create));
routes.get("/reservations", requireAdmin, asyncHandler(reservationController.list));
routes.get("/reservations/:id", asyncHandler(reservationController.get));

routes.post("/payments/culqi", validate(paymentSchema), asyncHandler(paymentController.card));
routes.post("/payments/yape", validate(paymentSchema), asyncHandler(paymentController.yape));
routes.get("/payments", requireAdmin, asyncHandler(paymentController.list));
routes.post("/webhooks/culqi", asyncHandler(paymentController.webhook));

routes.post("/contact", validate(contactSchema), asyncHandler(contactController.create));
routes.get("/contact", requireAdmin, asyncHandler(contactController.list));
routes.get("/testimonials", asyncHandler(contactController.testimonials));
routes.get("/settings/public", asyncHandler(operationsController.publicSettings));
routes.get("/settings", requireAdmin, asyncHandler(operationsController.adminSettings));
routes.put("/settings", requireAdmin, validate(businessSettingsSchema), asyncHandler(operationsController.saveSettings));
routes.get("/tours/:id/departures", asyncHandler(operationsController.departures));
routes.post("/tours/:id/departures", requireAdmin, validate(departureSchema), asyncHandler(operationsController.createDeparture));
routes.get("/admin/testimonials", requireAdmin, asyncHandler(operationsController.testimonials));
routes.post("/admin/testimonials", requireAdmin, validate(testimonialSchema), asyncHandler(operationsController.createTestimonial));
routes.put("/admin/testimonials/:id", requireAdmin, validate(testimonialSchema), asyncHandler(operationsController.updateTestimonial));
