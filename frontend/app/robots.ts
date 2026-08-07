import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agencia-de-tours-three.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/pago/", "/confirmacion/"] }],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
