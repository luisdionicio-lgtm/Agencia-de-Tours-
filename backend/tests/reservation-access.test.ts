import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { prisma } from "../src/lib/prisma";
import { reservationService } from "../src/services/reservation.service";
import { tourService } from "../src/services/tour.service";
import { AppError } from "../src/utils/AppError";

// Prisma delegates use proxy methods without normal property descriptors.
function stub(t: TestContext, target: any, method: string, implementation: (...args: any[]) => any) {
  const original = target[method];
  const replacement = t.mock.fn(implementation);
  target[method] = replacement;
  t.after(() => { target[method] = original; });
  return replacement;
}

test("un token ajeno no permite leer datos ni ejecutar mantenimiento", async (t) => {
  const lookup = stub(t, prisma.reservation, "findFirst", async () => null);
  const expiry = stub(t, prisma.reservation, "findMany", async () => { throw new Error("No debe consultar reservas"); });
  await assert.rejects(reservationService.publicStatus(12, "token-ajeno"), (error: unknown) => error instanceof AppError && error.statusCode === 404);
  assert.deepEqual(lookup.mock.calls[0].arguments[0].where, { id: 12, publicToken: "token-ajeno" });
  assert.equal(expiry.mock.calls.length, 0);
});

test("el estado público excluye documentos, comprobantes y auditorías", async (t) => {
  stub(t, prisma.reservation, "findMany", async () => []);
  let calls = 0;
  const lookup = stub(t, prisma.reservation, "findFirst", async () => ++calls === 1 ? { id: 12 } : { id: 12, status: "PENDIENTE", payments: [{ status: "PENDIENTE" }] });
  const result = await reservationService.publicStatus(12, "token-privado");
  const selection = lookup.mock.calls[1].arguments[0].select;
  assert.deepEqual(selection.customer, { select: { fullName: true, email: true, phone: true } });
  assert.deepEqual(selection.payments.select, { status: true });
  assert.equal(result.paymentSubmitted, true);
  assert.equal("payments" in result, false);
  assert.equal("publicToken" in result, false);
});

test("rechaza viajes pasados antes de crear clientes o descontar cupos", async (t) => {
  stub(t, prisma.reservation, "findMany", async () => []);
  stub(t, prisma.tour, "findUnique", async () => ({ id: 1, status: "ACTIVO", price: 500 }));
  const transaction = stub(t, prisma, "$transaction", async () => { throw new Error("No debe escribir"); });
  await assert.rejects(reservationService.create({ tourId: 1, fullName: "Prueba", email: "test@example.com", peopleCount: 1, travelDate: new Date("2000-01-01") }), (error: unknown) => error instanceof AppError && error.statusCode === 422);
  assert.equal(transaction.mock.calls.length, 0);
});

test("no permite saltarse las salidas programadas usando cupos generales", async (t) => {
  stub(t, prisma.reservation, "findMany", async () => []);
  stub(t, prisma.tour, "findUnique", async () => ({ id: 1, status: "ACTIVO", price: 500 }));
  stub(t, prisma.tourDeparture, "count", async () => 1);
  await assert.rejects(reservationService.create({ tourId: 1, fullName: "Prueba", email: "test@example.com", peopleCount: 1, travelDate: new Date("2099-01-01") }), (error: unknown) => error instanceof AppError && error.statusCode === 422);
});

test("un tour desactivado no se publica mediante su URL directa", async (t) => {
  stub(t, prisma.reservation, "findMany", async () => []);
  stub(t, prisma.tour, "findUnique", async () => ({ id: 1, status: "INACTIVO" }));
  await assert.rejects(tourService.get("1"), (error: unknown) => error instanceof AppError && error.statusCode === 404);
});
