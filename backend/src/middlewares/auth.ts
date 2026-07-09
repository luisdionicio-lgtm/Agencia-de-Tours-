import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export type AuthUser = { id: number; email: string; role: "ADMIN" | "CLIENT" };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new AppError(401, "Token requerido");

  const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
  if (payload.role !== "ADMIN") throw new AppError(403, "Acceso solo para administradores");

  req.user = payload;
  next();
}

