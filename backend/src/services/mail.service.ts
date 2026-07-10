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
      `Reserva recibida #${reservation.id} - Jhon Tours`,
      `
        <h2>Hola ${reservation.customer.fullName}</h2>
        <p>Recibimos tu reserva para <strong>${reservation.tour.title}</strong> (${reservation.tour.destination}).</p>
        <p><strong>Personas:</strong> ${reservation.peopleCount}</p>
        <p><strong>Total:</strong> ${formatAmount(reservation.totalAmount)}</p>
        <p>Tu reserva esta pendiente de pago. Gracias por confiar en Jhon Tours.</p>
      `
    );
  },
  sendPaymentConfirmed(reservation: ReservationEmail) {
    return sendMail(
      reservation.customer.email,
      `Pago confirmado #${reservation.id} - Jhon Tours`,
      `
        <h2>Pago confirmado</h2>
        <p>Hola ${reservation.customer.fullName}, tu pago para <strong>${reservation.tour.title}</strong> fue confirmado.</p>
        <p><strong>Destino:</strong> ${reservation.tour.destination}</p>
        <p><strong>Personas:</strong> ${reservation.peopleCount}</p>
        <p><strong>Total:</strong> ${formatAmount(reservation.totalAmount)}</p>
        <p>Un asesor de Jhon Tours se comunicara contigo para coordinar los detalles finales.</p>
      `
    );
  }
};
