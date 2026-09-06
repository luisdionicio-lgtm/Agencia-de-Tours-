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
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7).trim() : undefined;
  if (!token) throw new AppError(401, "Token requerido");

  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      audience: env.JWT_AUDIENCE,
      issuer: env.JWT_ISSUER
    });
    if (typeof payload === "string" || typeof payload.id !== "number" || typeof payload.email !== "string" || !["ADMIN", "WORKER", "CLIENT"].includes(payload.role)) {
      throw new AppError(401, "Token invalido o vencido");
    }
    const user = { id: payload.id, email: payload.email, role: payload.role as AuthUser["role"] };
    req.user = user;
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "Token invalido o vencido");
  }
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
