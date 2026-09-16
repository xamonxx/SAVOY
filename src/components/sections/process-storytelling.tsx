"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, Check, ChevronDown, DraftingCompass, Factory, FileText, MessagesSquare, Ruler, Truck } from "lucide-react";

import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import type { ProcessStep, ProjectImage } from "@/types";
import styles from "./process-storytelling.module.css";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type ProcessStorytellingProps = {
  steps: ProcessStep[];
  images: ProjectImage[];
};

const stepIcons = [MessagesSquare, Ruler, DraftingCompass, FileText, Factory, Truck];

export function ProcessStorytelling({ steps, images }: ProcessStorytellingProps) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const summaryRefs = useRef<Array<HTMLElement | null>>([]);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const prefersReduced = useReducedMotion();
  const lenis = useLenis();
  const current = steps[active];
  const image = images[active];
  const imageRatio = { "--process-image-ratio": image ? image.width / image.height : 0.8 } as CSSProperties;

  const commit = useCallback((index: number) => {
    if (activeRef.current === index) return;
    activeRef.current = index;
    setActive(index);
  }, []);

  useGSAP(() => {
    const track = trackRef.current;
    const scene = sceneRef.current;
    if (!track || !scene || !steps.length || prefersReduced !== false) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 1024px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)", () => {
      // Only hydrated, roomy desktop layouts reserve scroll space.
      track.dataset.scrollStory = "true";
      const sync = (trigger: ScrollTrigger) => {
        commit(Math.min(steps.length - 1, Math.floor(trigger.progress * steps.length)));
      };
      const trigger = ScrollTrigger.create({
        trigger: track,
        start: "top 112px",
        end: () => "+=" + Math.max(1, track.offsetHeight - scene.offsetHeight),
        invalidateOnRefresh: true,
        onUpdate: sync,
        onRefresh: sync,
        onEnter: sync,
        onEnterBack: sync,
      });
      triggerRef.current = trigger;

      const observer = new ResizeObserver(() => trigger.refresh());
      observer.observe(scene);

      return () => {
        observer.disconnect();
        triggerRef.current = null;
        delete track.dataset.scrollStory;
      };
    });
    return () => media.revert();
  }, { scope: trackRef, dependencies: [steps.length, prefersReduced], revertOnUpdate: true });

  const selectStep = (index: number) => {
    const trigger = triggerRef.current;
    if (trigger) {
      const destination = trigger.start + (trigger.end - trigger.start) * ((index + 0.5) / steps.length);
      if (lenis) lenis.scrollTo(destination, { immediate: true });
      else window.scrollTo({ top: destination, behavior: "instant" });
    }
    commit(index);
  };

  const navigateStep = (event: KeyboardEvent<HTMLElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowDown") next = Math.min(steps.length - 1, index + 1);
    else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = steps.length - 1;
    else return;
    event.preventDefault();
    selectStep(next);
    summaryRefs.current[next]?.focus({ preventScroll: true });
  };

  if (!current) return null;

  return (
    <div ref={trackRef} className={styles.track}>
      <div ref={sceneRef} className={cn(styles.scene, "grid items-start gap-space-xl lg:grid-cols-12 lg:gap-space-2xl")}>
        <div className="hidden min-w-0 lg:col-span-6 lg:block">
          <div className={styles.mediaStack} style={imageRatio}>
          <div className="mb-space-md flex items-center justify-between text-label-md text-pure-white/70 [letter-spacing:0]">
            <span>SAVOY / Proses pengerjaan</span>
            <span className="tabular-nums">{current.index} / {steps.at(-1)?.index}</span>
          </div>
          <div className={cn(styles.mediaFrame, "relative w-full overflow-hidden rounded-md bg-pure-white/5")}>
            <AnimatePresence initial={false}>
              {image && (
                <motion.div
                  key={image.src}
                  initial={prefersReduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReduced ? 0 : 0.6, ease: easeOutEditorial }}
                  className="absolute inset-0"
                >
                  <Image src={image.src} alt={image.alt} fill loading="eager" sizes="(min-width: 1024px) 520px, 100vw" className="object-contain" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="absolute left-space-lg top-space-lg inline-flex items-center gap-space-xs rounded-sm bg-surface px-space-sm py-space-xs text-label-md text-primary [letter-spacing:0]">
              <span aria-hidden className="size-1.5 rounded-full bg-primary-container" />
              Tahap {current.index}
            </span>
          </div>
          <div className="mt-space-lg flex items-start gap-space-lg">
            <span aria-hidden className="shrink-0 text-[56px] font-semibold leading-none tabular-nums text-primary-container">{current.index}</span>
            <div className="min-w-0 flex-1 pt-space-2xs">
              <p className="text-[22px] font-medium leading-snug text-pure-white">{current.title}</p>
              <div aria-hidden className="mt-space-md grid grid-cols-6 gap-space-xs">
                {steps.map((step, index) => (
                  <span key={step.index} className={cn(styles.rule, index <= active ? "text-primary-container" : "text-pure-white/15")} />
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-6">
          <div className="mb-space-sm flex items-center justify-between gap-space-md pb-space-sm">
            <span className="text-label-md text-primary-container [letter-spacing:0]">Tahapan pengerjaan</span>
            <ArrowDown aria-hidden className="size-4 text-primary-container" />
          </div>
          <ol>
            {steps.map((step, index) => {
              const isActive = active === index;
              const Icon = stepIcons[index] ?? Check;
              const stepImage = images[index];
              return (
                <li key={step.index} aria-current={isActive ? "step" : undefined}>
                  <details open={isActive} className={cn(styles.step, "group relative border-b border-pure-white/15")}>
                    {isActive && <span aria-hidden className={cn(styles.rule, "absolute inset-x-0 top-0 text-primary-container")} />}
                    <motion.summary
                      ref={node => { summaryRefs.current[index] = node; }}
                      className={cn(styles.summary, "flex min-h-16 cursor-pointer items-center gap-space-sm py-space-md focus-visible:outline-primary-container sm:gap-space-md", isActive ? "text-primary-container" : "text-pure-white/90")}
                      onClick={event => { event.preventDefault(); selectStep(index); }}
                      onKeyDown={event => navigateStep(event, index)}
                      whileHover={prefersReduced ? undefined : { x: 3 }}
                      transition={{ duration: duration.micro }}
                    >
                      <span aria-hidden className={cn("flex size-9 shrink-0 items-center justify-center rounded-full border text-label-md tabular-nums [letter-spacing:0]", isActive ? "border-primary-container bg-primary-container text-primary" : "border-pure-white/20 text-pure-white/65")}>
                        {index < active ? <Check className="size-4" /> : step.index}
                      </span>
                      <h3 className="min-w-0 flex-1 text-body-md font-semibold leading-snug">
                        {step.title}
                      </h3>
                      <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", isActive && "rotate-180")} />
                    </motion.summary>
                    <div className="pb-space-lg pl-[48px] sm:pl-[52px]">
                      <div className="mb-space-sm flex items-center gap-space-xs text-primary-container">
                        <Icon aria-hidden className="size-4" strokeWidth={1.7} />
                        <span className="text-label-md [letter-spacing:0]">Tahap {step.index}</span>
                      </div>
                      <p className="text-body-sm leading-relaxed text-pure-white/80 sm:text-body-md lg:text-body-sm">{step.body}</p>
                      {stepImage && (
                        <div className={cn(styles.mediaFrame, "relative mt-space-lg overflow-hidden rounded-md bg-pure-white/5 lg:hidden")} style={{ "--process-image-ratio": stepImage.width / stepImage.height } as CSSProperties}>
                          <Image src={stepImage.src} alt={stepImage.alt} fill loading={isActive ? "eager" : "lazy"} sizes="(min-width: 640px) 80vw, 75vw" className="object-contain" />
                        </div>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
