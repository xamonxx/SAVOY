"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";

import { Eyebrow } from "@/components/ui/typography";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import type { ApproachCard } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const gsapEase = `cubic-bezier(${easeOutEditorial.join(",")})`;

export function ApproachMotion({ items }: { items: ApproachCard[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".approach-kicker", {
        y: 18,
        opacity: 0.72,
        duration: duration.editorial,
        ease: gsapEase,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });

      gsap.from(".approach-card", {
        y: 36,
        opacity: 0.72,
        filter: "blur(8px)",
        stagger: 0.08,
        duration: duration.editorial,
        ease: gsapEase,
        scrollTrigger: {
          trigger: ".approach-grid",
          start: "top 78%",
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-surface py-space-4xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-hairline-strong to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-space-3xl h-40 w-40 rounded-full bg-primary-container/10 blur-3xl"
      />
      <div className="container-editorial relative">
        <div className="approach-kicker mb-space-2xl grid items-end gap-space-lg lg:grid-cols-12 lg:gap-gutter-desktop">
          <div className="space-y-space-xs lg:col-span-8">
            <Eyebrow>Pendekatan SAVOY</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Bukan sekadar membuat furniture.
              <br />
              Kami merancang bagaimana ruang Anda bekerja.
            </h2>
          </div>
          <p className="max-w-md text-body-sm text-on-surface-variant lg:col-span-4 lg:ml-auto">
            Integrasi desain arsitektural dan produksi mandiri memastikan setiap
            sentimeter lemari, kabinet, dan panel terpasang rapi sesuai anatomi rumah
            Anda.
          </p>
        </div>

        {/*
          A stepper, not four independent feature cards: the copy already
          calls this "satu proses terpadu" (one integrated process), so the
          layout should say that before a reader gets to the words. The
          connecting line only reads correctly across a single row, hence
          `xl:block` - at narrower widths the grid wraps to two columns and a
          horizontal line would visually connect the wrong cards.
        */}
        <ol className="approach-grid relative grid gap-x-space-lg gap-y-space-lg sm:grid-cols-2 xl:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[22px] hidden h-px bg-border-hairline-strong xl:block"
          />
          {items.map((item) => (
            <motion.li
              key={item.index}
              className="approach-card group relative flex flex-col gap-space-md"
              whileHover={reducedMotion ? undefined : { y: -4 }}
              whileTap={reducedMotion ? undefined : { y: -1 }}
              transition={{ duration: duration.micro, ease: easeOutEditorial }}
            >
              <span className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border-hairline-strong bg-surface text-label-md font-bold text-on-surface transition-colors duration-300 group-hover:border-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container">
                {item.index}
              </span>
              <div className="space-y-space-2xs rounded-lg border border-border-hairline bg-surface-container-lowest p-space-lg shadow-hairline transition-[border-color,box-shadow] duration-300 group-hover:border-primary-container group-hover:shadow-panel">
                <h3 className="text-headline-sm font-semibold leading-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  {item.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
