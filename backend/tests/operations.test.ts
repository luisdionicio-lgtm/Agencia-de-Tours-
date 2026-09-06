import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { businessSettingsSchema, contactSchema, departureSchema, idParamSchema, loginSchema, paymentSchema, reservationSchema, testimonialSchema, tourSchema } from "../src/validators/schemas";
import { escapeHtml } from "../src/services/mail.service";
import { env, parseBooleanEnvironmentValue } from "../src/config/env";
import { requireStaff } from "../src/middlewares/auth";
import { AppError } from "../src/utils/AppError";

test("no permite publicar políticas incompletas", () => {
  assert.equal(businessSettingsSchema.safeParse({ tradeName: "JohnToursPerú", policiesPublished: true }).success, false);
  assert.equal(businessSettingsSchema.safeParse({ tradeName: "JohnToursPerú", policiesPublished: false }).success, true);
});

test("solo publica testimonios verificados", () => {
  const base = { name: "Cliente real", comment: "Una experiencia verificable y documentada.", rating: 5 };
  assert.equal(testimonialSchema.safeParse({ ...base, verified: false, published: true }).success, false);
  assert.equal(testimonialSchema.safeParse({ ...base, verified: true, published: true }).success, true);
});

test("valida fechas y capacidad de salidas", () => {
  assert.equal(departureSchema.safeParse({ startDate: "2026-08-10", endDate: "2026-08-09", capacity: 10 }).success, false);
  assert.equal(departureSchema.safeParse({ startDate: "2026-08-10", endDate: "2026-08-12", capacity: 10 }).success, true);
});

test("un adelanto exige porcentaje", () => {
  const tour = { title: "Cusco", destination: "Cusco", price: 100, type: "NACIONAL", currency: "PEN", paymentMode: "DEPOSIT" };
  assert.equal(tourSchema.safeParse(tour).success, false);
  assert.equal(tourSchema.safeParse({ ...tour, depositPercent: 30 }).success, true);
});

test("el registro Yape exige token privado y referencia", () => {
  const payload = { reservationId: 10, reservationToken: "550e8400-e29b-41d4-a716-446655440000", referenceCode: "JT-000010-2026", amount: 200, paidAt: "2026-07-26T10:00:00-05:00" };
  assert.equal(paymentSchema.safeParse(payload).success, true);
  assert.equal(paymentSchema.safeParse({ reservationId: 10, referenceCode: "JT-000010-2026" }).success, false);
  assert.equal(paymentSchema.safeParse({ ...payload, reservationToken: "token-publico-invalido" }).success, false);
});

test("normaliza identidad y limita entradas publicas", () => {
  const login = loginSchema.parse({ email: "  ADMIN@JohnTours.pe ", password: "una-clave-segura" });
  assert.equal(login.email, "admin@johntours.pe");
  assert.equal(contactSchema.safeParse({ fullName: "Persona", email: "persona@example.com", message: "x".repeat(3001) }).success, false);
  assert.equal(reservationSchema.safeParse({ tourId: 1, fullName: "Persona", email: "persona@example.com", travelDate: "2026-10-10", peopleCount: 21 }).success, false);
});

test("rechaza identificadores invalidos antes de consultar la base", () => {
  assert.equal(idParamSchema.safeParse({ id: "15" }).success, true);
  assert.equal(idParamSchema.safeParse({ id: "../../etc/passwd" }).success, false);
  assert.equal(idParamSchema.safeParse({ id: "0" }).success, false);
});

test("escapa datos variables antes de generar correos HTML", () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});

test("interpreta correctamente las banderas de entorno", () => {
  assert.equal(parseBooleanEnvironmentValue("false"), false);
  assert.equal(parseBooleanEnvironmentValue("TRUE"), true);
});

test("acepta solo tokens de personal con firma, emisor y audiencia validos", () => {
  const token = jwt.sign({ id: 7, email: "asesor@johntours.pe", role: "WORKER" }, env.JWT_SECRET, {
    algorithm: "HS256", issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE, expiresIn: "1m"
  });
  let authorized = false;
  requireStaff(
    { headers: { authorization: `Bearer ${token}` } } as Request,
    {} as Response,
    (() => { authorized = true; }) as NextFunction
  );
  assert.equal(authorized, true);
  assert.throws(
    () => requireStaff({ headers: { authorization: "Bearer token-invalido" } } as Request, {} as Response, (() => undefined) as NextFunction),
    (error: unknown) => error instanceof AppError && error.statusCode === 401
  );
});
