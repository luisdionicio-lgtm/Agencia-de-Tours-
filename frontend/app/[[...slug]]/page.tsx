import type { Metadata } from "next";
import { ClientShell } from "../../src/ClientShell";
import { siteConfig } from "../../src/config/site";
import { tourTitles } from "../../src/config/routeMetadata";

type PageProps = { params: Promise<{ slug?: string[] }> };

// oxlint-disable-next-line react/only-export-components
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const segments = (await params).slug ?? [];
  const path = `/${segments.join("/")}`;
  const tourTitle = segments[0] === "tours" && segments[1] ? tourTitles[segments[1]] : undefined;
  const titles: Record<string, string> = {
    "/": "JohnToursPerú | Viaja seguro, vive extraordinario",
    "/tours": "Tours nacionales e internacionales | JohnToursPerú",
    "/legal/terminos": "Términos y condiciones | JohnToursPerú",
    "/legal/privacidad": "Privacidad | JohnToursPerú",
    "/legal/cancelaciones": "Cancelaciones | JohnToursPerú",
    "/legal/reembolsos": "Reembolsos | JohnToursPerú"
  };
  const title = tourTitle ? `${tourTitle} | JohnToursPerú` : titles[path] ?? "JohnToursPerú";
  const description = tourTitle
    ? `Conoce el itinerario, servicios y condiciones referenciales del viaje ${tourTitle}. Recibe una propuesta personalizada por WhatsApp.`
    : path === "/tours"
      ? "Explora viajes nacionales e internacionales con itinerarios claros y asesoría personalizada de JohnToursPerú."
      : "Tours nacionales e internacionales con orientación clara, atención directa y acompañamiento de JohnToursPerú.";
  const privateRoute = ["admin", "pago", "confirmacion", "demo", "reservar"].includes(segments[0] ?? "");
  const noIndex = siteConfig.presentationMode || privateRoute;

  return {
    title,
    description,
    alternates: { canonical: path || "/" },
    robots: { index: !noIndex, follow: !noIndex },
    openGraph: { title, description, url: path || "/", siteName: siteConfig.name, locale: "es_PE", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: siteConfig.name }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] }
  };
}

export default function Page() {
  return <ClientShell />;
}
