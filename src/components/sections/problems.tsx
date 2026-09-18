import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";
import { SectionHeading, TextLink } from "@/components/ui/typography";
import { problems } from "@/data/content";
import { site } from "@/lib/site";

/** Section 02 - Problem awareness. */
export function Problems() {
  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow="Sebelum memilih furniture"
            title="Furniture yang bagus belum tentu tepat untuk ruangan Anda."
            lead="Setiap rumah memiliki ukuran, aktivitas, kebutuhan penyimpanan, dan karakter yang berbeda. Karena itu, custom furniture seharusnya tidak dimulai dari sekadar memilih model di katalog. Ia dimulai dari memahami ruang."
            className="max-w-3xl"
          />
        </Reveal>

        {/*
          Photography-led identity (redesign plan, Problems): this is the only
          one of the site's six card-template sections with images, so the
          index numeral moves onto the photo itself - a large, bold mark over
          a directional bottom scrim, the same gradient technique the hero and
          portfolio gallery already use, rather than a small caption in the
          text block below. `rounded-sm`, not the site's default `rounded-md`,
          for a sharper, more graphic frame that reads distinct from Approach's
          ledger rows and Guarantees' boxless list.
        */}
        <RevealGroup
          as="ul"
          className="mt-space-xl sm:mt-space-2xl grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop lg:grid-cols-4"
        >
          {problems.map((problem) => (
            <RevealItem
              as="li"
              key={problem.index}
              className="group flex flex-col justify-between overflow-hidden rounded-sm bg-surface-container-lowest shadow-hairline transition-shadow hover:shadow-panel"
            >
              <div>
                {problem.image ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container-high">
                    <Image
                      src={problem.image}
                      alt={problem.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 45vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-scrim-black/80 via-scrim-black/10 to-transparent"
                    />
                    <span className="absolute bottom-space-2xs left-space-xs sm:bottom-space-xs sm:left-space-sm text-2xl sm:text-4xl font-bold leading-none text-inverse-on-surface/90">
                      {problem.index}
                    </span>
                  </div>
                ) : null}
                <div className="space-y-space-2xs p-space-sm sm:space-y-space-xs sm:p-space-md lg:p-space-lg">
                  <h3 className="text-sm sm:text-base lg:text-headline-sm font-semibold leading-snug text-on-surface">
                    {problem.title}
                  </h3>
                  <p className="text-xs sm:text-body-sm leading-relaxed text-on-surface-variant">
                    {problem.body}
                  </p>
                </div>
              </div>
              <div className="px-space-sm pb-space-sm sm:px-space-md sm:pb-space-md lg:px-space-lg lg:pb-space-lg">
                <span aria-hidden className="block h-0.5 sm:h-1 w-6 sm:w-8 rounded-full bg-primary-container" />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-space-2xl">
          <div className="flex flex-col items-start justify-between gap-space-md rounded-md bg-surface-container p-space-lg md:flex-row md:items-center">
            <p className="flex items-start gap-space-sm text-body-md font-medium text-on-surface">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-container">
                <BadgeCheck aria-hidden className="size-5 text-deep-black" />
              </span>
              <span className="pt-1">
                Di {site.shortName}, setiap proyek dimulai dari kebutuhan ruang dan
                orang yang menggunakannya — bukan dari katalog massal.
              </span>
            </p>
            <TextLink href="/survey" className="shrink-0 uppercase">
              Jadwalkan Diskusi
            </TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
