import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agencia-de-tours-three.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/tours", "/tours/1", "/tours/2", "/tours/3", "/tours/4", "/tours/5"];
  return paths.map((path, index) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: index < 2 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.75
  }));
}
