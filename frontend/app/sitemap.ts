import type { MetadataRoute } from "next";
import { sampleTourIds } from "../src/config/routeMetadata";
import { siteConfig } from "../src/config/site";

const siteUrl = siteConfig.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/tours", ...sampleTourIds.map((id) => `/tours/${id}`)];
  return paths.map((path, index) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: index < 2 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.75
  }));
}
