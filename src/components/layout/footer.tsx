"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Mail, MessageCircle, MessageSquarePlus } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { navLinks } from "@/components/layout/nav-links";
import { SocialLinks } from "@/components/layout/social-links";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { track } from "@/lib/analytics";
import { site } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { servedLocations } from "@/data/projects";

/**
 * A row in one of the footer lists.
 *
 * Real height rather than the `tap-safe` pseudo-element: these rows sit 8px
 * and 4px apart, so an invisible 44px slab on each would overlap the rows
 * above and below it and the topmost one would swallow taps meant for its
 * neighbours. Growing the rows is the only version that works, so on touch
 * the lists hand their spacing over to the rows themselves.
 *
 * The inline `Kebijakan Privasi` link in the bottom bar is deliberately left
 * out: it sits inside a sentence, where a block-level 44px row would break
 * the line it belongs to.
 *
 * `translate-x` on hover, not just a color change - a one-pixel nudge is the
 * same "the row is listening" cue the rest of the site uses for interactive
 * rows (cards, buttons), so a plain text link doesn't feel inert next to them.
 */
const footerRowClasses =
  "inline-flex items-center gap-1.5 transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-on-surface pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:translate-x-0";

/** Small rule before each column heading - the same dash-as-accent language `.rule` uses elsewhere, just static. */
function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-space-2xs text-label-eyebrow uppercase text-muted-gray">
      <span aria-hidden className="h-px w-4 bg-primary-container" />
      {children}
    </h2>
  );
}

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Only the first handful of towns, so the line stays a proof point rather
  // than a wall of place names.
  const locationSample = servedLocations.slice(0, 8);

  // Decides whether the brand column renders an icon row at all - an
  // uppercase "Social" heading over an empty `<ul>` (SocialLinks quietly
  // returns null with nothing configured) used to leave a floating label
  // with dead space under it.
  const hasSocial = Object.values(site.social).some(Boolean);
  const whatsappUrl = buildWhatsAppUrl({ source: "footer" });

  return (
    <footer className="relative overflow-hidden border-t border-border-hairline-bold bg-surface">
      {/* Giant watermark wordmark - the same "brand as texture" move the rest
          of the site makes with oversized faded numerals (Approach, FAQ).
          `select-none`/`aria-hidden`: purely decorative, and at this size a
          stray text selection would look like a bug. Clipped by the
          footer's own `overflow-hidden`, not a fixed width, so it never
          forces a horizontal scrollbar. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.14em] right-0 hidden select-none whitespace-nowrap text-[220px] font-bold leading-none tracking-tight text-on-surface/[0.03] lg:block xl:text-[280px]"
      >
        {site.name}
      </span>

      <div className="container-editorial relative py-space-4xl">
        <div className="grid gap-space-2xl lg:grid-cols-12 lg:gap-gutter-desktop">
          <div className="space-y-space-md lg:col-span-5 lg:pr-space-xl">
            <BrandMark tone="dark" size="footer" />
            <p className="max-w-md text-body-sm leading-relaxed text-on-surface-variant">
              {site.description}
            </p>
            {site.foundedYear ? (
              <span className="block text-label-eyebrow uppercase text-muted-gray">
                Berdiri sejak {site.foundedYear} • Studio Interior & Furniture Custom
              </span>
            ) : (
              <span className="block text-label-eyebrow uppercase text-muted-gray">
                Studio Interior & Furniture Custom
              </span>
            )}
            {hasSocial ? (
              <div className="pt-space-2xs">
                <SocialLinks />
              </div>
            ) : null}
          </div>

          <nav aria-label="Navigasi footer" className="space-y-space-md lg:col-span-2">
            <ColumnHeading>Navigasi</ColumnHeading>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant pointer-coarse:space-y-0">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerRowClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/survey" className={footerRowClasses}>
                  Ajukan Survey
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-space-md lg:col-span-2">
            <ColumnHeading>Kontak Langsung</ColumnHeading>
            <ul className="space-y-space-xs text-body-sm text-on-surface-variant pointer-coarse:space-y-0">
              <li>
                <Link href="/contact" className={footerRowClasses}>
                  <MessageCircle aria-hidden className="size-3.5 shrink-0 text-primary-container" />
                  Hubungi kami
                </Link>
              </li>
              {site.email ? (
                <li>
                  <a href={`mailto:${site.email}`} className={footerRowClasses}>
                    <Mail aria-hidden className="size-3.5 shrink-0 text-primary-container" />
                    {site.email}
                  </a>
                </li>
              ) : null}
              {whatsappUrl ? (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("whatsapp_click", { source: "footer" })}
                    className={footerRowClasses}
                  >
                    <MessageCircle aria-hidden className="size-3.5 shrink-0 text-primary-container" />
                    Chat WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          {/* The footer's one standout block - dark against the rest of the
              (now plain `bg-surface`) footer, so it's the single contrast note
              rather than a slightly-different card in an otherwise uniform
              gray band. A soft radial highlight behind the badge keeps that
              contrast from reading as a flat sticker pasted on top. */}
          <div className="relative space-y-space-md overflow-hidden rounded-lg bg-espresso-deep p-space-lg shadow-panel lg:col-span-3">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-primary-container/25 blur-3xl"
            />
            <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-pure-white/10 text-primary-fixed">
              <MessageSquarePlus aria-hidden className="size-4" />
            </span>
            <div className="relative space-y-space-2xs">
              <span className="block text-label-eyebrow uppercase text-primary-fixed">
                Mulai Diskusi
              </span>
              <h2 className="text-headline-sm font-semibold text-inverse-on-surface">
                Mulai Proyek Anda
              </h2>
            </div>
            <p className="relative text-body-sm text-inverse-on-surface/75">
              Ceritakan ruang yang ingin Anda kerjakan. Konsultasi awal dan estimasi
              tidak dikenakan biaya.
            </p>
            <WhatsAppCta source="footer" size="sm" className="relative w-full">
              Reservasi Konsultasi
            </WhatsAppCta>
          </div>
        </div>

        {locationSample.length > 0 ? (
          <p className="mt-space-3xl border-t border-border-hairline pt-space-lg text-body-sm text-muted-gray">
            <span className="text-on-surface-variant">Pernah dikerjakan di:</span>{" "}
            {locationSample.join(", ")}
            {servedLocations.length > locationSample.length ? ", dan kota lainnya" : ""}
            . Melayani pemesanan dari seluruh Indonesia.
          </p>
        ) : null}

        <div className="mt-space-lg flex flex-col items-center justify-between gap-space-sm border-t border-border-hairline pt-space-lg text-body-sm text-muted-gray sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-space-sm gap-y-space-2xs">
            <span>
              © {year} {site.name}. All Rights Reserved.
            </span>
            <span aria-hidden>•</span>
            <Link href="/privacy" className="transition-colors hover:text-on-surface">
              Kebijakan Privasi
            </Link>
          </p>
          <p className="flex items-center gap-space-sm text-label-eyebrow uppercase">
            <span>Interior Custom</span>
            <span aria-hidden className="text-primary-container">•</span>
            <span>Furniture Custom</span>
            <span aria-hidden className="text-primary-container">•</span>
            <span>Indonesia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
