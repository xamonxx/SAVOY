"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { blurPlaceholder } from "@/lib/image-placeholder";
import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import type { Project } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CARD_SIZES = "(min-width: 1280px) 26vw, 32vw";

type HorizontalGalleryProps = {
  projects: Project[];
};

/**
 * Pinned horizontal scroll gallery for the homepage portfolio preview.
 *
 * Desktop only - the parent renders this inside `hidden lg:block` and keeps a
 * plain vertical grid for everything below it, so there is never a competing
 * mobile layout to reconcile here. The section pins in place and the card
 * track translates horizontally as the reader scrolls vertically past it -
 * the same mechanism as GSAP's own horizontal-scrolling-gallery demo. GSAP
 * owns this scroll-linked transform (pasal 22): scrubbed, not eased, because
 * it has to track the scrollbar exactly rather than settle after it.
 *
 * A visitor who prefers reduced motion still gets the gallery, just without
 * the pin or the scrub - the strip becomes a plain, user-driven horizontal
 * scroller instead.
 *
 * Motion is layered on top for the two things GSAP is not doing here: the
 * per-card hover/press lift, and the slim progress rail that mirrors how far
 * through the pinned scroll the reader currently is.
 */
export function HorizontalGallery({ projects }: HorizontalGalleryProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const prefersReduced = useReducedMotion();

  /*
   * Fed straight from ScrollTrigger's own `onUpdate`, not Motion's `useScroll`.
   * While the section is pinned it sits at `position: fixed`, so its own
   * bounding rect stops moving for the whole pinned range - the exact signal
   * `useScroll` needs to compute progress from. GSAP already knows the true
   * progress because it is the thing driving the pin; Motion's job here is
   * only to render that number, not to re-derive it.
   */
  const railProgress = useMotionValue(0);

  useGSAP(
    () => {
      if (prefersReduced || projects.length < 2) return;

      /*
       * The parent hides this component below `lg` with a CSS class, not by
       * unmounting it - so without this guard a narrow window would still
       * measure and pin a collapsed, `display: none` track. `matchMedia` also
       * covers the case a static viewport check would miss: a browser window
       * resized across the breakpoint after mount, where it re-measures and
       * creates or tears down the pin on its own.
       */
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const track = trackRef.current;
        const strip = stripRef.current;
        if (!track || !strip) return;

        const distance = track.scrollWidth - strip.clientWidth;
        if (distance <= 0) return;

        const tween = gsap.to(track, {
          x: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: () => `+=${distance}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => railProgress.set(self.progress),
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [prefersReduced, projects.length], revertOnUpdate: true }
  );

  const pinned = !prefersReduced;

  return (
    <section ref={rootRef} className={cn("relative", pinned && "h-screen")}>
      <div
        className={cn(
          "flex h-full flex-col justify-center overflow-hidden",
          !pinned && "py-space-2xl"
        )}
      >
        <div
          ref={stripRef}
          className={cn(
            "min-w-0 px-margin-desktop [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            pinned ? "overflow-visible" : "overflow-x-auto"
          )}
        >
          <ul ref={trackRef} className="flex w-max gap-gutter-desktop">
            {projects.map((project) => (
              <GalleryCard key={project.slug} project={project} />
            ))}
          </ul>
        </div>

        {/* Progress rail - only meaningful while GSAP actually drives a
            pinned scroll; reduced motion never updates it, so it never
            renders in that case. */}
        {pinned ? (
          <div aria-hidden className="mt-space-xl">
            <div className="container-editorial">
              {/* Fill is absolutely positioned over the track rather than a
                  same-height sibling - `scaleX` alone doesn't guarantee the
                  two stay pixel-aligned across every browser's rounding of a
                  1px box, and any drift there reads as two separate lines
                  instead of one bar with a fill. No `overflow-hidden` on the
                  track: that would clip the fill's own glow at the edges. */}
              <div className="relative h-[3px] w-full rounded-full bg-border-hairline-strong">
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-primary to-primary-container",
                    // A pointed tip, not a flat or rounded one - the same
                    // tapered-arrow shape `.rule` uses elsewhere in this
                    // codebase, just a shallower taper: at this length a 28%
                    // point (right for a short dash) would read as an arrow,
                    // not a progress bar. `drop-shadow`, not `shadow`: a
                    // box-shadow glows the fill's rectangular *bounding box*
                    // regardless of the clip-path, a drop-shadow follows the
                    // clipped silhouette - the point actually glows instead
                    // of sitting inside a rectangular halo.
                    "[clip-path:polygon(0_0,94%_0,100%_50%,94%_100%,0_100%)]",
                    "drop-shadow-[0_0_6px_rgba(154,178,121,0.85)]"
                  )}
                  style={{ scaleX: railProgress }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GalleryCard({ project }: { project: Project }) {
  const meta = [project.location, project.year ? String(project.year) : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <li className="w-[32vw] shrink-0 xl:w-[26vw]">
      <motion.article whileHover="hover" whileTap="hover" initial="rest">
        <Link
          href={`/portfolio/${project.slug}`}
          className="block focus-visible:outline-offset-4"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-container-high">
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
              transition={{ duration: duration.standard, ease: easeOutEditorial }}
              className="absolute inset-0"
            >
              <Image
                src={project.coverImage}
                alt={project.gallery[0]?.alt ?? project.title}
                fill
                sizes={CARD_SIZES}
                loading="lazy"
                {...blurPlaceholder(project.coverBlurDataURL)}
                className="object-cover"
              />
            </motion.div>

            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-scrim-black/90 via-scrim-black/45 to-transparent"
            />

            <motion.span
              aria-hidden
              variants={{
                rest: { opacity: 0, scale: 0.7 },
                hover: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: duration.micro, ease: easeOutEditorial }}
              className="absolute right-space-sm top-space-sm flex size-9 items-center justify-center rounded-full bg-pure-white text-deep-black"
            >
              <ArrowUpRight aria-hidden className="size-4" />
            </motion.span>

            <div className="absolute inset-x-0 bottom-0 p-space-md text-pure-white">
              <span className="text-label-eyebrow uppercase text-primary-fixed [text-shadow:0_1px_4px_rgba(9,11,13,0.55)]">
                {project.categoryShort}
              </span>
              <h3 className="mt-space-2xs text-headline-sm font-bold leading-tight">
                {project.title}
              </h3>
              {meta ? (
                <p className="mt-space-2xs text-body-sm text-surface-container-highest">
                  {meta}
                </p>
              ) : null}
            </div>
          </div>
        </Link>
      </motion.article>
    </li>
  );
}
