const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://savoyinterior.com";

function optional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function numeric(value: string | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const latitude = numeric(process.env.NEXT_PUBLIC_LATITUDE);
const longitude = numeric(process.env.NEXT_PUBLIC_LONGITUDE);

const streetAddress = optional(process.env.NEXT_PUBLIC_STREET_ADDRESS);
const addressLocality = optional(process.env.NEXT_PUBLIC_ADDRESS_LOCALITY);
const addressRegion = optional(process.env.NEXT_PUBLIC_ADDRESS_REGION);
const postalCode = optional(process.env.NEXT_PUBLIC_ADDRESS_POSTAL_CODE);

export const site = {
  name: "SAVOY",
  shortName: "SAVOY",
  tagline: "Quiet Spatial Luxury",
  description:
    "SAVOY merancang, memproduksi, dan memasang interior serta custom furniture berdasarkan kondisi ruang, proporsi, ergonomi, gaya hidup, material, dan kualitas instalasi.",
  metaDescription:
    "Interior dan custom furniture SAVOY dirancang dari kondisi ruang nyata, proporsi, material, dan cara hidup pengguna.",
  url: rawSiteUrl.replace(/\/+$/, ""),
  locale: "id-ID",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  email: optional(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  social: {
    instagram: optional(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  },
  mapsUrl: optional(process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL),
  address:
    streetAddress || addressLocality
      ? {
          streetAddress,
          addressLocality,
          addressRegion,
          postalCode,
          addressCountry: "ID",
        }
      : null,
  geo: latitude !== null && longitude !== null ? { latitude, longitude } : null,
  businessDataRequired:
    !process.env.NEXT_PUBLIC_WHATSAPP_NUMBER &&
    !process.env.NEXT_PUBLIC_CONTACT_EMAIL &&
    !addressLocality,
} as const;

export type Site = typeof site;

export function hasWhatsApp(): boolean {
  return /^\d{8,15}$/.test(site.whatsappNumber);
}
