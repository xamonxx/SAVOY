import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

/**
 * Web app manifest.
 *
 * Mostly for Android "add to home screen" and for the richer icon a browser
 * shows in tab groups and install prompts. Both sizes use the same
 * diamond-V mark as `icon.png`/`apple-icon.png` - these files are separate
 * only because a manifest needs real static assets at fixed pixel sizes,
 * not Next's dynamically-generated favicon route.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Interior & Custom Furniture`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    lang: "id-ID",
    background_color: "#FFFFFF",
    theme_color: "#0F3C2C",
    icons: [
      {
        src: "/logo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
