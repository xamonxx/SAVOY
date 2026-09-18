"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";

import { duration, easeOutEditorial } from "@/components/motion/tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

/** GSAP's `ease` option takes a CSS cubic-bezier string, not the raw array
 * Motion's `transition.ease` expects - same curve, two different formats. */
const gsapEditorialEase = `cubic-bezier(${easeOutEditorial.join(",")})`;

type HeroHeadlineProps = {
  children: ReactNode;
  className?: string;
};

/**
 * The hero headline's own entrance: a per-word cascade, not the site's usual
 * whole-block fade (`Reveal`) every other section uses.
 *
 * Split → animate → revert is GSAP's own documented pattern for SplitText
 * (demos.gsap.com/demo/revert-after-animation): the per-word wrapper `<div>`s
 * SplitText inserts only need to exist while the stagger is actually
 * running. `revert()` the instant it finishes puts the plain text node back
 * - the one a screen reader announces normally, a visitor can select and
 * copy, and that rewraps correctly if the window resizes - rather than
 * leaving the heading permanently split for a one-time entrance.
 *
 * Reduced motion skips this whole effect: the heading is real server-
 * rendered text by default, and nothing here ever depends on the split
 * having run for the words to be visible or readable.
 */
export function HeroHeadline({ children, className }: HeroHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReduced || !ref.current) return;

      const split = SplitText.create(ref.current, {
        type: "words",
        wordsClass: "hero-headline-word",
      });

      gsap.set(split.words, { opacity: 0, y: 24 });

      const tween = gsap.to(split.words, {
        opacity: 1,
        y: 0,
        duration: duration.editorial,
        ease: gsapEditorialEase,
        stagger: 0.05,
        onComplete: () => split.revert(),
      });

      return () => {
        tween.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [prefersReduced] }
  );

  return (
    <h1 ref={ref} className={className}>
      {children}
    </h1>
  );
}
