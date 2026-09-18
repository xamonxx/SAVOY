import Image from "next/image";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { SocialLinks } from "@/components/layout/social-links";
import { cn } from "@/lib/cn";
import { storyImages } from "@/data/projects";

/**
 * Section 16 - Behind the scenes.
 *
 * The prototype filled this row with stock "workshop" imagery. Until the studio
 * supplies process photography, it shows four real finished installations
 * instead of pretending to show the workshop.
 */
export function BehindTheScenes() {
  const shots = storyImages.slice(0, 4);
  if (shots.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-xl space-y-space-xs">
            <Eyebrow>Dokumentasi pengerjaan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Ikuti perjalanan transformasi setiap ruang.
            </h2>
          </div>
        </Reveal>

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-gutter-desktop md:grid-cols-4"
        >
          {shots.map((shot, index) => (
            <RevealItem
              as="li"
              key={shot.src}
              // Staggered only from `md`, where the grid is a single row of
              // four: offsetting every other tile there reads as a deliberate
              // photo row. Below `md` the grid is two tight rows of two, where
              // the same offset would crowd the row underneath it instead.
              className={cn(index % 2 === 1 && "md:mt-space-lg")}
            >
              {/* `group` + lift + image zoom: the same hover language
                  `knowledge-preview.tsx` already uses, so this section stops
                  being the one spot on the page with zero interaction
                  feedback. */}
              <div className="group relative aspect-square overflow-hidden rounded-md bg-surface-container-high shadow-hairline transition-shadow duration-300 hover:shadow-panel">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 768px) 22vw, 45vw"
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={2}>
          <SocialLinks className="mt-space-2xl" variant="showcase" />
        </Reveal>
      </div>
    </section>
  );
}
