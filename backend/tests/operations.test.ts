import assert from "node:assert/strict";
import test from "node:test";
import { businessSettingsSchema, departureSchema, testimonialSchema, tourSchema } from "../src/validators/schemas";

test("no permite publicar políticas incompletas", () => {
  assert.equal(businessSettingsSchema.safeParse({ tradeName: "Jhon Tours", policiesPublished: true }).success, false);
  assert.equal(businessSettingsSchema.safeParse({ tradeName: "Jhon Tours", policiesPublished: false }).success, true);
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
