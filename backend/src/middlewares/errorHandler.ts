import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({ message: "Datos invalidos", issues: error.issues });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message, details: error.details });
  }

  console.error(error);
  return res.status(500).json({ message: "Error interno del servidor" });
};

