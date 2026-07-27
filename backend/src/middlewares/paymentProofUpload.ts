import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../utils/AppError";

export const PAYMENT_PROOF_MAX_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: PAYMENT_PROOF_MAX_BYTES },
  fileFilter: (_req, file, callback) => callback(null, allowedTypes.has(file.mimetype))
});

function hasValidSignature(file: Express.Multer.File) {
  const bytes = file.buffer;
  if (file.mimetype === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mimetype === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (file.mimetype === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  return false;
}

export function paymentProofUpload(req: Request, res: Response, next: NextFunction) {
  upload.single("proof")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return next(new AppError(422, error.code === "LIMIT_FILE_SIZE" ? "El comprobante supera el limite de 5 MB" : "No se pudo procesar el comprobante"));
    }
    if (error) return next(new AppError(422, "Formato de comprobante no permitido"));
    if (!req.file) return next(new AppError(422, "Adjunta el comprobante Yape"));
    if (!hasValidSignature(req.file)) return next(new AppError(422, "El contenido del archivo no coincide con un formato seguro"));
    next();
  });
}
