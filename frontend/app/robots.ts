import type { MetadataRoute } from "next";
import { siteConfig } from "../src/config/site";

const siteUrl = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  if (siteConfig.presentationMode) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/pago/", "/confirmacion/"] }],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
