import type { NextFunction, Request, Response } from "express";
import { createHash, randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

type RateEntry = { count: number; resetAt: number };

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  const requestId = typeof req.headers["x-request-id"] === "string" && /^[a-zA-Z0-9_-]{8,80}$/.test(req.headers["x-request-id"])
    ? req.headers["x-request-id"]
    : randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  res.setHeader("Cache-Control", "no-store");
  if (env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
}

export function rateLimitKey(parts: unknown[]) {
  return createHash("sha256").update(parts.map((part) => String(part ?? "").trim().toLowerCase()).join("|")).digest("hex");
}

export function createRateLimiter({ windowMs, max, keyGenerator }: { windowMs: number; max: number; keyGenerator?: (req: Request) => string }) {
  const entries = new Map<string, RateEntry>();
  const maxTrackedClients = 10_000;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyGenerator?.(req) || req.ip || req.socket.remoteAddress || "unknown";
    const current = entries.get(key);

    if (!current && entries.size >= maxTrackedClients) {
      for (const [entryKey, value] of entries) if (value.resetAt <= now) entries.delete(entryKey);
      if (entries.size >= maxTrackedClients) return next(new AppError(429, "Servicio temporalmente ocupado. Intenta nuevamente más tarde."));
    }

    const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    entry.count += 1;
    entries.set(key, entry);

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      return next(new AppError(429, "Demasiadas solicitudes. Intenta nuevamente más tarde."));
    }
    next();
  };
}
