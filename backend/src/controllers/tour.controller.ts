import type { Request, Response } from "express";
import { tourService } from "../services/tour.service";

export const tourController = {
  async list(req: Request, res: Response) {
    res.json(await tourService.list(req.query));
  },
  async get(req: Request, res: Response) {
    res.json(await tourService.get(String(req.params.id)));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await tourService.create(req.body));
  },
  async update(req: Request, res: Response) {
    res.json(await tourService.update(Number(req.params.id), req.body));
  },
  async remove(req: Request, res: Response) {
    res.json(await tourService.remove(Number(req.params.id)));
  }
};
