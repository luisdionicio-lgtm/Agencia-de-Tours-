import type { Request, Response } from "express";
import { reservationService } from "../services/reservation.service";

export const reservationController = {
  async create(req: Request, res: Response) {
    res.status(201).json(await reservationService.create(req.body));
  },
  async list(_req: Request, res: Response) {
    res.json(await reservationService.list());
  },
  async get(req: Request, res: Response) {
    res.json(await reservationService.get(Number(req.params.id)));
  }
};

