import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { paymentSchema } from "../validators/schemas";

export const paymentController = {
  async yape(req: Request, res: Response) {
    const input = paymentSchema.parse(req.body);
    res.status(201).json(await paymentService.submitYape(input, req.file!));
  },
  async confirm(req: Request, res: Response) {
    res.json(await paymentService.confirmYape(Number(req.params.id), req.user!.id));
  },
  async reject(req: Request, res: Response) {
    res.json(await paymentService.rejectYape(Number(req.params.id), req.user!.id));
  },
  async list(_req: Request, res: Response) {
    res.json(await paymentService.list());
  },
  async proof(req: Request, res: Response) {
    const proof = await paymentService.proof(Number(req.params.id));
    res.setHeader("Content-Type", proof.mimeType);
    res.setHeader("Content-Length", String(proof.sizeBytes));
    res.setHeader("Content-Disposition", `inline; filename="${proof.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(proof.data);
  }
};
