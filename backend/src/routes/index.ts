import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { contactController } from "../controllers/contact.controller";
import { paymentController } from "../controllers/payment.controller";
import { reservationController } from "../controllers/reservation.controller";
import { tourController } from "../controllers/tour.controller";
import { operationsController } from "../controllers/operations.controller";
import { getIntegrationStatus } from "../config/env";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAdmin, requireStaff } from "../middlewares/auth";
import { createRateLimiter } from "../middlewares/security";
import { validate } from "../middlewares/validate";
import { paymentProofUpload } from "../middlewares/paymentProofUpload";
import { businessSettingsSchema, contactSchema, departureSchema, loginSchema, paymentSchema, reservationSchema, testimonialSchema, tourSchema } from "../validators/schemas";

export const routes = Router();

routes.get("/health", (_req, res) => res.json({ status: "ok", service: "JhonToursPerú API" }));
routes.get("/health/integrations", requireAdmin, (_req, res) => res.json(getIntegrationStatus()));

routes.post("/auth/login", createRateLimiter({ windowMs: 15 * 60_000, max: 5 }), validate(loginSchema), asyncHandler(authController.login));

routes.get("/tours", asyncHandler(tourController.list));
routes.get("/tours/:id", asyncHandler(tourController.get));
routes.post("/tours", requireAdmin, validate(tourSchema), asyncHandler(tourController.create));
routes.put("/tours/:id", requireAdmin, validate(tourSchema), asyncHandler(tourController.update));
routes.delete("/tours/:id", requireAdmin, asyncHandler(tourController.remove));

routes.post("/reservations", validate(reservationSchema), asyncHandler(reservationController.create));
routes.get("/reservations", requireStaff, asyncHandler(reservationController.list));
routes.get("/reservations/:id", requireStaff, asyncHandler(reservationController.get));
routes.patch("/reservations/:id/cancel", requireStaff, asyncHandler(reservationController.cancel));

routes.post("/payments/yape", createRateLimiter({ windowMs: 15 * 60_000, max: 10 }), paymentProofUpload, asyncHandler(paymentController.yape));
routes.get("/payments", requireStaff, asyncHandler(paymentController.list));
routes.get("/payments/:id/proof", requireStaff, asyncHandler(paymentController.proof));
routes.patch("/payments/:id/confirm", requireStaff, asyncHandler(paymentController.confirm));
routes.patch("/payments/:id/reject", requireStaff, asyncHandler(paymentController.reject));

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
