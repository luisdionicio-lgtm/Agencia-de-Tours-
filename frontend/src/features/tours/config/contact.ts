import type { Reservation, Tour } from "../../../shared/types";

export const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51966779705";
export const whatsappDisplay = "+51 966 779 705";
export const reservationAmount = 200;
export const isStaticPresentation = !process.env.NEXT_PUBLIC_API_URL;
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || isStaticPresentation;

export const demoStaffAccounts = [
  { email: "admin.demo@johntours.pe", password: "JohnToursAdmin2026!", role: "ADMIN" as const },
  { email: "trabajador.demo@johntours.pe", password: "JohnToursWorker2026!", role: "WORKER" as const }
];

export const socialLinks = {
  instagram: "https://www.instagram.com/johntoursperu?igsh=dm1hc3ZweGlkeWR2",
  tiktok: "https://www.tiktok.com/@johntoursperu?_r=1&_t=ZS-988zH7tdmDM"
};

export const buildWhatsAppUrl = (message: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

export const whatsappMessages = {
  general: "Hola JohnToursPerú, deseo información para cotizar un viaje.",
  tour: (tour: Tour) => `Hola JohnToursPerú, deseo cotizar el tour ${tour.title} para ${tour.destination}.`,
  reservation: (reservation: Reservation) => `Hola JohnToursPerú, deseo confirmar mi reserva #${reservation.id} para ${reservation.tour.title}.`
};
