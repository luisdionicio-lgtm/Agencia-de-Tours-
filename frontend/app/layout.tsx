import type { Metadata, Viewport } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  title: "Jhon Tours | Viajes que dejan huella",
  description: "Tours nacionales e internacionales con itinerarios claros, pagos seguros y asistencia personalizada en cada etapa."
};

export const viewport: Viewport = { themeColor: "#061b34" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
