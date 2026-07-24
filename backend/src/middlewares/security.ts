import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

type RateEntry = { count: number; resetAt: number };

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Cache-Control", "no-store");
  next();
}

export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const entries = new Map<string, RateEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = entries.get(key);
    const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    entry.count += 1;
    entries.set(key, entry);

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entries.size > 10_000) {
      for (const [entryKey, value] of entries) if (value.resetAt <= now) entries.delete(entryKey);
    }
    if (entry.count > max) return next(new AppError(429, "Demasiadas solicitudes. Intenta nuevamente más tarde."));
    next();
  };
}
