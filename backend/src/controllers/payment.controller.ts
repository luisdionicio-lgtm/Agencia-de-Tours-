import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  async yape(req: Request, res: Response) {
    const { reservationId, reservationToken, referenceCode } = req.body;
    res.status(201).json(await paymentService.submitYape(Number(reservationId), reservationToken, referenceCode));
  },
  async confirm(req: Request, res: Response) {
    res.json(await paymentService.confirmYape(Number(req.params.id)));
  },
  async reject(req: Request, res: Response) {
    res.json(await paymentService.rejectYape(Number(req.params.id)));
  },
  async list(_req: Request, res: Response) {
    res.json(await paymentService.list());
  }
};
