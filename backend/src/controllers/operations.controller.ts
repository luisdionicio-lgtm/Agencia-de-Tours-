import type { Request, Response } from "express";
import { operationsService } from "../services/operations.service";

export const operationsController = {
  publicSettings: async (_req: Request, res: Response) => res.json(await operationsService.publicSettings()),
  adminSettings: async (_req: Request, res: Response) => res.json(await operationsService.adminSettings()),
  saveSettings: async (req: Request, res: Response) => res.json(await operationsService.saveSettings(req.body)),
  departures: async (req: Request, res: Response) => res.json(await operationsService.listDepartures(Number(req.params.id))),
  createDeparture: async (req: Request, res: Response) => res.status(201).json(await operationsService.createDeparture(Number(req.params.id), req.body)),
  testimonials: async (_req: Request, res: Response) => res.json(await operationsService.listTestimonialsAdmin()),
  createTestimonial: async (req: Request, res: Response) => res.status(201).json(await operationsService.createTestimonial(req.body)),
  updateTestimonial: async (req: Request, res: Response) => res.json(await operationsService.updateTestimonial(Number(req.params.id), req.body))
};
