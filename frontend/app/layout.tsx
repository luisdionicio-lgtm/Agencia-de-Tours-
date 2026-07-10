import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";

// oxlint-disable-next-line react/only-export-components
export const metadata: Metadata = {
  title: "Jhon Tours",
  description: "Agencia de turismo con tours nacionales e internacionales."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
