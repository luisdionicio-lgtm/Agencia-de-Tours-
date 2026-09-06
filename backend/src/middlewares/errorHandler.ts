import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined;
  if (error instanceof ZodError) {
    return res.status(422).json({ message: "Datos invalidos", issues: error.issues, requestId });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message, details: error.details, requestId });
  }

  console.error(`[${requestId ?? "sin-request-id"}]`, error);
  return res.status(500).json({ message: "Error interno del servidor", requestId });
};
