"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";

import { Eyebrow } from "@/components/ui/typography";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import type { Guarantee } from "@/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const gsapEase = `cubic-bezier(${easeOutEditorial.join(",")})`;

export function GuaranteesMotion({ items }: { items: Guarantee[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".guarantee-aside", {
        y: 24,
        opacity: 0.72,
        duration: duration.editorial,
        ease: gsapEase,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });

      gsap.from(".guarantee-row", {
        x: 28,
        opacity: 0.72,
        stagger: 0.07,
        duration: duration.editorial,
        ease: gsapEase,
        scrollTrigger: {
          trigger: ".guarantee-list",
          start: "top 76%",
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-surface-container-low py-space-4xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,60,44,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(15,60,44,0.04)_1px,transparent_1px)] bg-[size:72px_72px]"
      />
      <div className="container-editorial relative grid gap-space-2xl xl:grid-cols-12 xl:items-start">
        <div className="guarantee-aside xl:sticky xl:top-28 xl:col-span-4">
          <div className="space-y-space-sm">
            <Eyebrow>Kepastian & kenyamanan</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Produksi tidak dimulai dari asumsi.
            </h2>
            <p className="max-w-md text-body-lg text-on-surface-variant">
              Enam komitmen kejelasan untuk memastikan Anda tenang sebelum kayu
              pertama dipotong.
            </p>
          </div>
          <div className="mt-space-xl hidden rounded-lg border border-border-hairline bg-surface-container-lowest p-space-lg shadow-hairline xl:block">
            <p className="text-label-eyebrow uppercase text-primary">kontrol mutu</p>
            <p className="mt-space-xs text-headline-sm font-semibold text-on-surface">
              Ukur, verifikasi, setujui, baru produksi.
            </p>
          </div>
        </div>

        <ol className="guarantee-list divide-y divide-border-hairline rounded-lg border border-border-hairline bg-surface-container-lowest shadow-panel xl:col-span-8">
          {items.map((guarantee) => (
            <motion.li
              key={guarantee.index}
              className="guarantee-row group grid gap-space-md p-space-lg sm:grid-cols-[5rem_1fr] sm:p-space-xl"
              whileHover={reducedMotion ? undefined : { x: 6 }}
              transition={{ duration: duration.micro, ease: easeOutEditorial }}
            >
              <span
                aria-hidden
                className="text-headline-md font-bold leading-none text-primary-container transition-colors group-hover:text-primary"
              >
                {String(guarantee.index).padStart(2, "0")}
              </span>
              <div className="space-y-space-2xs">
                <h3 className="text-headline-sm font-semibold leading-tight text-on-surface">
                  {guarantee.title}
                </h3>
                <p className="max-w-2xl text-body-sm leading-relaxed text-on-surface-variant">
                  {guarantee.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
