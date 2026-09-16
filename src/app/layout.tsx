import type { Metadata, Viewport } from "next";
import { Inter_Tight, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StickyMobileCta } from "@/components/layout/sticky-mobile-cta";
import {
  jsonLdGraph,
  jsonLdScript,
  organisationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import { site } from "@/lib/site";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Interior Design & Custom Furniture`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "id_ID",
    url: site.url,
    images: [{ url: "/opengraph-image" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F7F4EE",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${interTight.variable} ${manrope.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-dvh bg-savoy-ivory text-savoy-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(
            jsonLdGraph(organisationJsonLd(), websiteJsonLd())
          )}
        />
        <a href="#main" className="skip-link">
          Lompat ke konten utama
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyMobileCta />
      </body>
    </html>
  );
}
