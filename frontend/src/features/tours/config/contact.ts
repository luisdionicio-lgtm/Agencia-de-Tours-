import type { Reservation, Tour } from "../../../shared/types";
import { siteConfig, whatsappDisplay } from "../../../config/site";

export const whatsapp = siteConfig.whatsapp;
export { whatsappDisplay };
export const reservationAmount = siteConfig.reservationAmount;
export const isStaticPresentation = !process.env.NEXT_PUBLIC_API_URL;

// A URL or an old session must never switch a live installation into demo mode.
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const useSampleCatalog = isDemoMode || isStaticPresentation;

export const demoStaffAccounts = [
  { email: "admin.demo@johntours.pe", password: "JohnToursAdmin2026!", role: "ADMIN" as const },
  { email: "trabajador.demo@johntours.pe", password: "JohnToursWorker2026!", role: "WORKER" as const }
];

export const socialLinks = {
  ...siteConfig.social
};

export const buildWhatsAppUrl = (message: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

export const whatsappMessages = {
  general: "Hola JohnToursPerú, deseo información para cotizar un viaje.",
  tour: (tour: Tour) => `Hola JohnToursPerú, deseo cotizar el tour ${tour.title} para ${tour.destination}.`,
  reservation: (reservation: Reservation) => `Hola JohnToursPerú, deseo confirmar mi reserva #${reservation.id} para ${reservation.tour.title}.`
};
