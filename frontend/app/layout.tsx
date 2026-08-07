import type { Metadata, Viewport } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://agencia-de-tours-three.vercel.app");
const headingFont = Montserrat({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["600", "700", "800", "900"] });
const bodyFont = Source_Sans_3({ subsets: ["latin"], variable: "--font-body", display: "swap", weight: ["400", "500", "600", "700"] });

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "JohnToursPerú | Viaja seguro, vive extraordinario",
  description: "Tours nacionales e internacionales, promociones escolares y grupos. Separa tu viaje con S/ 200 por Yape y atención directa por WhatsApp.",
  applicationName: "JohnToursPerú",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: "JohnToursPerú",
    title: "JohnToursPerú | Experiencias nacionales e internacionales",
    description: "Viajes diseñados para disfrutar con orientación cercana, reserva por Yape e itinerarios claros.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "JohnToursPerú, agencia de viajes y turismo" }]
  },
  twitter: { card: "summary_large_image", title: "JohnToursPerú", description: "Viaja seguro y vive experiencias extraordinarias.", images: ["/og.png"] }
};

// oxlint-disable-next-line react/only-export-components
export const viewport: Viewport = { themeColor: "#073b83" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "JohnToursPerú",
    url: siteUrl.toString(),
    logo: new URL("/john-tours-logo-cropped.png", siteUrl).toString(),
    email: "johntoursperu29@gmail.com",
    telephone: "+51 966 779 705",
    areaServed: ["Perú", "Internacional"],
    sameAs: ["https://www.instagram.com/johntoursperu", "https://www.tiktok.com/@johntoursperu"]
  };
  return (
    <html lang="es">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
