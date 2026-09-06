import nodemailer from "nodemailer";
import { env } from "../config/env";

type ReservationEmail = {
  id: number;
  customer: { fullName: string; email: string };
  tour: { title: string; destination: string };
  peopleCount: number;
  totalAmount: unknown;
  status: string;
};

const isSmtpConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.MAIL_FROM);

function formatAmount(value: unknown) {
  return new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(Number(value));
}

export function escapeHtml(value: unknown) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendMail(to: string, subject: string, html: string) {
  if (!isSmtpConfigured()) {
    const message = "SMTP no configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y MAIL_FROM para enviar correos.";
    if (env.NODE_ENV === "production") console.warn(message);
    return { skipped: true, reason: message };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  return transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
}

export const mailService = {
  sendReservationCreated(reservation: ReservationEmail) {
    return sendMail(
      reservation.customer.email,
      `Reserva recibida #${reservation.id} - JohnToursPerú`,
      `
        <h2>Hola ${escapeHtml(reservation.customer.fullName)}</h2>
        <p>Recibimos tu reserva para <strong>${escapeHtml(reservation.tour.title)}</strong> (${escapeHtml(reservation.tour.destination)}).</p>
        <p><strong>Personas:</strong> ${escapeHtml(reservation.peopleCount)}</p>
        <p><strong>Total:</strong> ${formatAmount(reservation.totalAmount)}</p>
        <p>Tu reserva está pendiente de pago. Gracias por confiar en JohnToursPerú.</p>
      `
    );
  },
  sendPaymentConfirmed(reservation: ReservationEmail) {
    return sendMail(
      reservation.customer.email,
      `Pago confirmado #${reservation.id} - JohnToursPerú`,
      `
        <h2>Pago confirmado</h2>
        <p>Hola ${escapeHtml(reservation.customer.fullName)}, tu pago para <strong>${escapeHtml(reservation.tour.title)}</strong> fue confirmado.</p>
        <p><strong>Destino:</strong> ${escapeHtml(reservation.tour.destination)}</p>
        <p><strong>Personas:</strong> ${escapeHtml(reservation.peopleCount)}</p>
        <p><strong>Total:</strong> ${formatAmount(reservation.totalAmount)}</p>
        <p>Un asesor de JohnToursPerú se comunicará contigo para coordinar los detalles finales.</p>
      `
    );
  }
};
