import type { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async login(req: Request, res: Response) {
    res.json(await authService.login(req.body.email, req.body.password));
  }
};

