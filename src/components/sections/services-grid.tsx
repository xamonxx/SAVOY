import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { arrowRowClasses, Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { services } from "@/data/content";

/**
 * Section 06 - Services.
 *
 * Seven cards, not the prototype's six: "Lemari Bawah Tangga" is the studio's
 * single largest body of work and had no slot in the original layout.
 */
export function ServicesGrid() {
  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-2xl space-y-space-xs">
            <Eyebrow>Lingkup layanan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Satu ruang atau satu rumah.
              <br />
              Dirancang sesuai kebutuhan Anda.
            </h2>
          </div>
        </Reveal>

        {/*
          Asymmetric hierarchy (redesign plan, ServicesGrid): the flagship
          service takes twice the area of its six siblings, on the same
          12-column split Survey/Faq/Materials already use elsewhere on the
          page - not a new grid idiom, just reused. Differentiates this
          section by composition rather than by decorating the same card
          shell differently again.
        */}
        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop md:grid-cols-2 lg:grid-cols-12"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const flagship = index === 0;
            return (
              <RevealItem
                as="li"
                key={service.slug}
                className={cn(
                  "flex flex-col gap-space-xs sm:gap-space-md rounded-md bg-surface-container-lowest p-space-sm sm:p-space-xl shadow-hairline transition-shadow hover:shadow-panel",
                  flagship ? "lg:col-span-6" : "lg:col-span-3"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-md",
                    flagship
                      ? "size-9 sm:size-14 bg-primary-container text-pure-white"
                      : "size-8 sm:size-12 bg-surface-container text-primary"
                  )}
                >
                  <Icon aria-hidden className={flagship ? "size-5 sm:size-7" : "size-4 sm:size-6"} />
                </span>
                <h3
                  className={cn(
                    "font-semibold text-on-surface leading-snug",
                    flagship ? "text-sm sm:text-headline-md" : "text-xs sm:text-headline-sm"
                  )}
                >
                  {service.title}
                </h3>
                <p className="flex-1 text-[11px] sm:text-body-sm leading-relaxed text-on-surface-variant">
                  {service.description}
                </p>
                <Link
                  href={`/services#${service.slug}`}
                  // Shared row, keeping `tap-safe`, with this grid's tighter
                  // mobile type and the extra breathing room above it.
                  className={cn(
                    arrowRowClasses,
                    "gap-1 pt-1 text-[11px] sm:gap-space-2xs sm:pt-0 sm:text-label-md",
                    "text-on-surface hover:text-primary"
                  )}
                >
                  {service.ctaLabel}
                  <ArrowRight
                    aria-hidden
                    className="size-3 sm:size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
