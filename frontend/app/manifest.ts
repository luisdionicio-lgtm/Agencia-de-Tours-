import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JohnToursPerú",
    short_name: "JohnToursPerú",
    description: "Tours nacionales e internacionales con atención personalizada.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2faff",
    theme_color: "#073b83",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
