import assert from "node:assert/strict";
import test from "node:test";
import { businessSettingsSchema, departureSchema, paymentSchema, testimonialSchema, tourSchema } from "../src/validators/schemas";

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
