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
    { scope: sectionRef, dependencies: [reducedMotion] }
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

        <ol className="approach-grid grid gap-space-sm sm:grid-cols-2 xl:grid-cols-4 xl:gap-space-md">
          {items.map((item) => (
            <motion.li
              key={item.index}
              className="approach-card group relative min-h-72 overflow-hidden rounded-lg border border-border-hairline bg-surface-container-lowest p-space-lg shadow-hairline transition-colors hover:border-primary-container sm:min-h-80 sm:p-space-xl xl:min-h-72"
              whileHover={reducedMotion ? undefined : { y: -8 }}
              whileTap={reducedMotion ? undefined : { y: -2 }}
              transition={{ duration: duration.micro, ease: easeOutEditorial }}
            >
              <span
                aria-hidden
                className="absolute -right-4 -top-8 select-none text-[112px] font-bold leading-none text-primary-container/12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:text-primary-container/18 sm:text-[136px]"
              >
                {item.index}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-space-lg bottom-0 h-px origin-left scale-x-0 bg-primary-container transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
              />
              <div className="relative flex h-full flex-col justify-between gap-space-xl">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-primary">
                  {item.index}
                </span>
                <div className="space-y-space-sm">
                  <h3 className="text-headline-sm font-semibold leading-tight text-on-surface">
                    {item.title}
                  </h3>
                  <p className="text-body-sm leading-relaxed text-on-surface-variant">
                    {item.body}
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
