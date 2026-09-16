import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Interior Design & Custom Furniture`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    lang: "id-ID",
    background_color: "#F7F4EE",
    theme_color: "#4F3B38",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
