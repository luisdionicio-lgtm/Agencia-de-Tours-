import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export type AuthUser = { id: number; email: string; role: "ADMIN" | "WORKER" | "CLIENT" };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function authenticate(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new AppError(401, "Token requerido");

  const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
  req.user = payload;
  return payload;
}

export function requireStaff(req: Request, _res: Response, next: NextFunction) {
  const payload = authenticate(req);
  if (!["ADMIN", "WORKER"].includes(payload.role)) throw new AppError(403, "Acceso solo para personal autorizado");
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const payload = authenticate(req);
  if (payload.role !== "ADMIN") throw new AppError(403, "Acceso solo para administradores");
  next();
}
