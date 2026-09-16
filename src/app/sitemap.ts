import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

const LAST_REVIEWED = "2026-09-16";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date(LAST_REVIEWED),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: new Date(LAST_REVIEWED),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
