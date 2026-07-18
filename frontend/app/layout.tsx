import type { Metadata, Viewport } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  title: "John Tours Perú | Viaja seguro, vive extraordinario",
  description: "Tours nacionales e internacionales, promociones escolares y grupos. Separa tu viaje con S/ 200 por Yape y atención directa por WhatsApp."
};

export const viewport: Viewport = { themeColor: "#073b83" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
