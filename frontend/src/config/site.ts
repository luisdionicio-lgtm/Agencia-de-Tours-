const rawWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51966779705";

export const siteConfig = {
  name: "JohnToursPerú",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://agencia-de-tours-three.vercel.app",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "johntoursperu29@gmail.com",
  whatsapp: rawWhatsapp.replace(/\D/g, ""),
  officeLabel: process.env.NEXT_PUBLIC_OFFICE_LABEL || "Atención virtual en Perú",
  secondaryPhone: process.env.NEXT_PUBLIC_SECONDARY_PHONE || "",
  reservationAmount: Number(process.env.NEXT_PUBLIC_RESERVATION_AMOUNT || 200),
  presentationMode: process.env.NEXT_PUBLIC_PRESENTATION_MODE === "true" || !process.env.NEXT_PUBLIC_API_URL,
  social: {
    instagram: "https://www.instagram.com/johntoursperu?igsh=dm1hc3ZweGlkeWR2",
    tiktok: "https://www.tiktok.com/@johntoursperu?_r=1&_t=ZS-988zH7tdmDM"
  }
} as const;

export const whatsappDisplay = siteConfig.whatsapp.startsWith("51") && siteConfig.whatsapp.length === 11
  ? `+51 ${siteConfig.whatsapp.slice(2, 5)} ${siteConfig.whatsapp.slice(5, 8)} ${siteConfig.whatsapp.slice(8)}`
  : `+${siteConfig.whatsapp}`;
