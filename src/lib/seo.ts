import type { Metadata } from "next";

import { site } from "@/lib/site";

export function absoluteUrl(path = "/"): string {
  if (path === "/") return site.url;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export const ORGANISATION_ID = `${site.url}/#organisation`;
export const WEBSITE_ID = `${site.url}/#website`;

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? "/opengraph-image";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: site.name,
      title,
      description,
      locale: "id_ID",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function organisationJsonLd() {
  const sameAs = [site.social.instagram, site.mapsUrl].filter(
    (value): value is string => Boolean(value)
  );

  const contactPoint = [
    site.whatsappNumber
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: `+${site.whatsappNumber}`,
          url: `https://wa.me/${site.whatsappNumber}`,
          availableLanguage: ["id-ID"],
          areaServed: "ID",
        }
      : null,
    site.email
      ? {
          "@type": "ContactPoint",
          contactType: "sales",
          email: site.email,
          availableLanguage: ["id-ID"],
          areaServed: "ID",
        }
      : null,
  ].filter((value): value is NonNullable<typeof value> => value !== null);

  return {
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": ORGANISATION_ID,
    name: site.name,
    alternateName: site.shortName,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    image: `${site.url}/brand/savoy-logo.jpg`,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/brand/savoy-logo.jpg`,
    },
    ...(site.email ? { email: site.email } : {}),
    ...(site.whatsappNumber ? { telephone: `+${site.whatsappNumber}` } : {}),
    ...(contactPoint.length ? { contactPoint } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(site.mapsUrl ? { hasMap: site.mapsUrl } : {}),
    ...(site.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(site.address.streetAddress
              ? { streetAddress: site.address.streetAddress }
              : {}),
            ...(site.address.addressLocality
              ? { addressLocality: site.address.addressLocality }
              : {}),
            ...(site.address.addressRegion
              ? { addressRegion: site.address.addressRegion }
              : {}),
            ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
            addressCountry: site.address.addressCountry,
          },
        }
      : {}),
    ...(site.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: site.geo.latitude,
            longitude: site.geo.longitude,
          },
        }
      : {}),
    currenciesAccepted: "IDR",
    areaServed: [{ "@type": "Country", name: "Indonesia" }],
    knowsLanguage: ["id-ID"],
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.metaDescription,
    inLanguage: "id-ID",
    publisher: { "@id": ORGANISATION_ID },
  };
}

export function webPageJsonLd({
  path,
  name,
  description,
  type = "WebPage",
}: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}) {
  const url = absoluteUrl(path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "id-ID",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANISATION_ID },
  };
}

export function jsonLdGraph(...nodes: unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}

export function jsonLdScript(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
