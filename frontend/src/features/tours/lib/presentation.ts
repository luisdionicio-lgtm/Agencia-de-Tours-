import type { Payment, Tour } from "../../../shared/types";

export type TourDeparture = NonNullable<Tour["departures"]>[number];

export const money = (value: string | number, currency: "PEN" | "USD" = "USD") =>
  new Intl.NumberFormat("es-PE", { currency, maximumFractionDigits: 0, style: "currency" }).format(Number(value));

export const tourCurrency = (tour: Pick<Tour, "type" | "currency">) =>
  tour.currency ?? (tour.type === "NACIONAL" ? "PEN" : "USD");

export const tourMoney = (tour: Pick<Tour, "price" | "type">, value: string | number = tour.price) =>
  Number(value) > 0 ? money(value, tourCurrency(tour)) : "Cotizar";

export const paymentMoney = (payment: Payment) =>
  payment.reservation?.tour ? tourMoney(payment.reservation.tour, payment.amount) : money(payment.amount);

export const destinationImage = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

export const reservationCode = (id: string | number) =>
  `JT-${String(id).slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
