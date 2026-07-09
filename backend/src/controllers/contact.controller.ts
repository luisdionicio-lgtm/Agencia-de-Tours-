import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { contactService } from "../services/contact.service";

export const contactController = {
  async create(req: Request, res: Response) {
    res.status(201).json(await contactService.create(req.body));
  },
  async list(_req: Request, res: Response) {
    res.json(await contactService.list());
  },
  async testimonials(_req: Request, res: Response) {
    res.json(await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }));
  }
};

