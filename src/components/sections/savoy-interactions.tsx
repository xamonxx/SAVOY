"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

import { faqs, materials, processSteps, services } from "@/data/savoy";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

export function HeroChoreography() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from("[data-hero-image]", {
        clipPath: "inset(12% 12% 12% 12%)",
        scale: 1.02,
        duration: 1.25,
        ease: "power3.out",
      });
      gsap.from("[data-hero-line]", {
        y: 42,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.from("[data-hero-cta]", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.45,
        ease: "power3.out",
      });
    },
    { scope }
  );

  return <div ref={scope} className="pointer-events-none absolute inset-0" aria-hidden />;
}

export function ProcessProgress() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        "[data-process-line]",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 72%",
            end: "bottom 62%",
            scrub: true,
          },
        }
      );
    },
    { scope }
  );

  return (
    <div ref={scope} className="mt-12">
      <div className="h-px bg-border-soft">
        <div data-process-line className="h-px bg-savoy-gold" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-6">
        {processSteps.map(([number, title, text]) => (
          <div key={number} className="space-y-3">
            <span className="meta-savoy text-savoy-gold">{number}</span>
            <h3 className="font-display text-2xl font-semibold">{title}</h3>
            <p className="text-sm leading-6 text-ink-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceSelector() {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        {services.map((item, index) => (
          <motion.button
            key={item.name}
            type="button"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            className={cn(
              "flex w-full items-center justify-between border-b border-border-soft py-5 text-left transition-colors",
              active === index ? "text-savoy-ink" : "text-ink-muted"
            )}
            whileHover={{ x: 4 }}
          >
            <span className="font-display text-3xl font-semibold">{item.name}</span>
            <span className="meta-savoy">{String(index + 1).padStart(2, "0")}</span>
          </motion.button>
        ))}
      </div>
      <div className="image-well min-h-[420px] p-8 text-savoy-ivory">
        <AnimatePresence mode="wait">
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28 }}
            className="flex h-full flex-col justify-between"
          >
            <span className="meta-savoy text-savoy-gold">Service Preview</span>
            <div className="space-y-4">
              <p className="font-display text-5xl font-semibold">{service.name}</p>
              <p className="max-w-md text-lg leading-8 text-savoy-ivory/78">
                {service.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function MaterialSelector() {
  const [active, setActive] = useState(0);
  const material = materials[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="image-well min-h-[520px] p-8 text-savoy-ivory">
        <AnimatePresence mode="wait">
          <motion.div
            key={material.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col justify-between"
          >
            <span className="meta-savoy text-savoy-gold">Material Experience</span>
            <div className="space-y-5">
              <h3 className="font-display text-6xl font-semibold">{material.name}</h3>
              <p className="max-w-lg text-lg leading-8 text-savoy-ivory/78">
                {material.description}
              </p>
              <details className="max-w-lg border-t border-border-dark pt-4 text-sm text-savoy-ivory/72">
                <summary className="cursor-pointer font-semibold text-savoy-ivory">
                  Technical detail
                </summary>
                <p className="mt-3">{material.detail}</p>
              </details>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="self-end">
        {materials.map((item, index) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "flex w-full items-center justify-between border-b border-border-soft py-5 text-left",
              active === index ? "text-savoy-ink" : "text-ink-muted"
            )}
          >
            <span className="text-lg font-semibold">{item.name}</span>
            {active === index ? <span className="h-px w-10 bg-savoy-gold" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BeforeAfter() {
  const [value, setValue] = useState(50);

  return (
    <div className="space-y-6">
      <div className="relative min-h-[460px] overflow-hidden bg-surface-muted">
        <div className="absolute inset-0 grid place-items-center bg-savoy-limestone text-savoy-espresso">
          <span className="meta-savoy">Before asset: PROJECT_DATA_REQUIRED</span>
        </div>
        <div
          className="absolute inset-0 grid place-items-center bg-savoy-espresso text-savoy-ivory"
          style={{ clipPath: `inset(0 0 0 ${value}%)` }}
        >
          <span className="meta-savoy">After asset: PROJECT_DATA_REQUIRED</span>
        </div>
        <input
          aria-label="Before after comparison"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="absolute inset-x-8 bottom-8 accent-savoy-gold"
        />
      </div>
      <div className="grid gap-4 text-sm leading-6 text-ink-muted md:grid-cols-3">
        <p>Outcome: PROJECT_DATA_REQUIRED</p>
        <p>Outcome: PROJECT_DATA_REQUIRED</p>
        <p>Outcome: PROJECT_DATA_REQUIRED</p>
      </div>
    </div>
  );
}

export function FAQList() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto max-w-3xl">
      {faqs.map((item, index) => (
        <div key={item.question} className="border-b border-border-soft">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-6 py-6 text-left"
            aria-expanded={open === index}
            onClick={() => setOpen(open === index ? -1 : index)}
          >
            <span className="text-lg font-semibold">{item.question}</span>
            <span className="text-savoy-gold">{open === index ? "−" : "+"}</span>
          </button>
          <AnimatePresence initial={false}>
            {open === index ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="pb-6 text-base leading-7 text-ink-muted">{item.answer}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
