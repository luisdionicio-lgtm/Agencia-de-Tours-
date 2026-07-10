import { PaymentMethod } from "@prisma/client";
import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  async card(req: Request, res: Response) {
    res.status(201).json(await paymentService.pay(Number(req.body.reservationId), PaymentMethod.CARD, req.body.token));
  },
  async yape(req: Request, res: Response) {
    res.status(201).json(await paymentService.pay(Number(req.body.reservationId), PaymentMethod.YAPE, req.body.token));
  },
  async webhook(req: Request, res: Response) {
    paymentService.verifyWebhookSignature(req.rawBody ?? JSON.stringify(req.body), req.headers["x-culqi-signature"] ?? req.headers["x-hook-signature"]);
    res.json(await paymentService.handleWebhook(req.body));
  },
  async list(_req: Request, res: Response) {
    res.json(await paymentService.list());
  }
};
