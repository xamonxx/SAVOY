"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { ArrowDown, Check, Clock3, DraftingCompass, Factory, FileText, Ruler, Wrench } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";
import type { TimelinePhase } from "@/types";
import styles from "./timeline-motion.module.css";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const chapterMedia = [
  { src: "/images/process/02-survey-lokasi.webp", alt: "Pengukuran ruang dengan alat laser" },
  { src: "/images/process/03-desain.webp", alt: "Visualisasi rancangan interior" },
  { src: "/images/process/04-penawaran-rab.webp", alt: "Perencanaan spesifikasi dan anggaran pekerjaan" },
  { src: "/images/process/05-produksi.webp", alt: "Pemotongan panel furniture di workshop" },
  { src: "/images/process/06-pengiriman-pemasangan.webp", alt: "Proses pemasangan furniture di lokasi" },
];
const chapterIcons = [Ruler, DraftingCompass, FileText, Factory, Wrench];
const number = (index: number) => String(index + 1).padStart(2, "0");

export function TimelineMotion({ phases, note }: { phases: TimelinePhase[]; note: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const current = phases[active];
  const currentMedia = chapterMedia[active];

  // Bare `href="#timeline-phase-N"` anchors jump instantly - the one abrupt
  // cut on a page that is otherwise all eased scrolling. `scroll-mt-28` on
  // each chapter already gives the correct header clearance for a native
  // jump, so the matching Lenis offset here is the same 112px, not a guess.
  const jumpToPhase = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    const target = document.getElementById(`timeline-phase-${index + 1}`);
    if (!target) return;
    event.preventDefault();
    setActive(index);
    if (lenis) lenis.scrollTo(target, { offset: -112, immediate: reducedMotion === true });
    else target.scrollIntoView({ behavior: reducedMotion === true ? "auto" : "smooth", block: "start" });
  };

  useGSAP(() => {
    const chapters = gsap.utils.toArray<HTMLElement>(".timeline-chapter", sectionRef.current);
    if (!chapters.length) return;

    // Measure real chapter positions so the photo follows the reader on every viewport.
    const syncChapter = () => {
      const readingLine = window.innerHeight * 0.48;
      let nearest = 0;
      let distance = Infinity;
      chapters.forEach((chapter, index) => {
        const rect = chapter.getBoundingClientRect();
        const nextDistance = Math.abs(rect.top + rect.height / 2 - readingLine);
        if (nextDistance < distance) {
          distance = nextDistance;
          nearest = index;
        }
      });
      setActive(previous => previous === nearest ? previous : nearest);
    };

    ScrollTrigger.create({
      trigger: ".timeline-story",
      start: "top 48%",
      end: "bottom 48%",
      onUpdate: syncChapter,
      // No `onRefresh` here, deliberately - this component has no viewport
      // gate, so it runs on mobile too, where the address bar collapsing or
      // expanding mid-pause changes `window.innerHeight` and triggers GSAP's
      // own resize-driven refresh. `onRefresh` would re-run `syncChapter`
      // against that new height with no actual scroll having happened,
      // visibly jumping the highlighted chapter while the reader is just
      // sitting still. `onUpdate` alone still keeps this fully live on every
      // genuine scroll; a refresh only needs to correct the trigger's own
      // start/end bookkeeping for the *next* one, not force an immediate
      // re-sync.
      onEnter: syncChapter,
      onEnterBack: syncChapter,
    });

    if (reducedMotion !== false) return;

    gsap.fromTo(".timeline-progress", { scaleY: 0 }, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline-chapter-list",
        start: "top 48%",
        end: "bottom 48%",
        scrub: 0.35,
      },
    });

    chapters.forEach(chapter => {
      gsap.from(chapter.querySelector(".timeline-chapter-content"), {
        y: 36,
        ease: "power2.out",
        scrollTrigger: { trigger: chapter, start: "top 90%", end: "top 45%", scrub: 0.5 },
      });
      gsap.fromTo(chapter.querySelector(".timeline-chapter-rule"), { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: chapter, start: "top 65%", end: "bottom 48%", scrub: true },
      });
    });
  }, { scope: sectionRef, dependencies: [reducedMotion], revertOnUpdate: true });

  if (!current) return null;

  return (
    <section id="timeline" ref={sectionRef} aria-labelledby="timeline-title" className="scroll-mt-24 border-t border-border-hairline bg-surface py-space-3xl [letter-spacing:0] lg:py-space-4xl">
      <div className="container-editorial">
        <div className="mb-space-2xl grid gap-space-lg lg:mb-space-3xl lg:grid-cols-12 lg:items-end">
          <div className="space-y-space-sm lg:col-span-7">
            <Eyebrow>Timeline pengerjaan</Eyebrow>
            <h2 id="timeline-title" className="max-w-3xl text-headline-lg-mobile text-on-surface [letter-spacing:0] lg:text-headline-lg lg:[letter-spacing:0]">
              Estimasi waktu yang realistis &amp; terukur.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="max-w-md text-body-md text-on-surface-variant">
              Setiap tahap dibuat berurutan agar keputusan desain, harga, produksi,
              dan pemasangan mudah dipantau tanpa menebak-nebak.
            </p>
            <div className="mt-space-lg flex items-center gap-space-sm text-label-md text-primary [letter-spacing:0]">
              <span className={cn(styles.horizontal, "w-10 shrink-0 text-primary-container")} aria-hidden />
              <span>{number(phases.length - 1)} tahap, satu alur terpadu</span>
              <ArrowDown aria-hidden className="size-4" />
            </div>
          </div>
        </div>

        <div className="timeline-story grid gap-space-xl lg:grid-cols-12 lg:gap-space-3xl">
          <aside className="hidden self-start lg:sticky lg:top-28 lg:col-span-5 lg:block motion-reduce:hidden">
            <div className="relative mb-space-md flex items-center justify-between pt-space-md">
              <span aria-hidden className={cn(styles.horizontal, "absolute inset-x-0 top-0 text-primary")} />
              <span className="text-label-md text-primary [letter-spacing:0]">SAVOY / Alur pengerjaan</span>
              <span className="text-label-md tabular-nums text-muted-gray [letter-spacing:0]">{number(active)} / {number(phases.length - 1)}</span>
            </div>
            <div className="relative aspect-[4/3] max-h-[45dvh] overflow-hidden rounded-md bg-surface-container">
              <AnimatePresence initial={false}>
                {currentMedia && (
                  <motion.div
                    key={currentMedia.src}
                    initial={reducedMotion ? false : { opacity: 0, scale: 1.035 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.55, ease: easeOutEditorial }}
                    className="absolute inset-0"
                  >
                    <Image src={currentMedia.src} alt={currentMedia.alt} fill loading="eager" sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="absolute left-space-md top-space-md rounded-sm bg-surface px-space-sm py-space-xs text-label-md text-primary [letter-spacing:0]">{current.index}</span>
            </div>
            <div className="mt-space-lg flex items-end justify-between gap-space-md">
              <div className="min-w-0">
                <p className="text-label-md text-muted-gray [letter-spacing:0]">Estimasi pengerjaan</p>
                <p className="mt-space-xs text-headline-sm font-semibold text-primary [letter-spacing:0]">{current.title}</p>
              </div>
              <span className="shrink-0 text-body-md font-semibold tabular-nums text-primary">{current.duration}</span>
            </div>
            <nav aria-label="Tahap pengerjaan" className="mt-space-lg grid grid-cols-5 gap-space-xs">
              {phases.map((phase, index) => (
                <motion.a
                  key={phase.index}
                  href={`#timeline-phase-${index + 1}`}
                  aria-label={`${phase.index}: ${phase.title}`}
                  aria-current={active === index ? "step" : undefined}
                  title={phase.title}
                  onClick={event => jumpToPhase(event, index)}
                  whileHover={reducedMotion ? undefined : { y: -3 }}
                  transition={{ duration: duration.micro }}
                  className={cn("relative flex min-h-11 items-center justify-center gap-1 text-label-md tabular-nums [letter-spacing:0]", index <= active ? "text-primary" : "text-muted-gray")}
                >
                  <span aria-hidden className={cn(styles.horizontal, "absolute inset-x-0 top-0", index <= active ? "text-primary" : "text-border-hairline")} />
                  {index < active ? <Check aria-hidden className="size-3" /> : null}
                  {number(index)}
                </motion.a>
              ))}
            </nav>
          </aside>

          <div className="relative min-w-0 lg:col-span-7 lg:pb-[30vh] motion-reduce:lg:col-span-12 motion-reduce:lg:pb-0">
            <div aria-hidden className="pointer-events-none absolute bottom-0 left-[18.5px] top-0 w-[3px] lg:bottom-[30vh] lg:left-[22.5px] motion-reduce:lg:bottom-0">
              <span className={cn(styles.vertical, "absolute inset-0 h-full text-border-hairline")} />
              <span className={cn(styles.vertical, "timeline-progress relative h-full origin-top text-primary-container")} />
            </div>
            <ol className="timeline-chapter-list relative">
            {phases.map((phase, index) => {
              const Icon = chapterIcons[index] ?? Clock3;
              const media = chapterMedia[index];
              const isActive = active === index;
              return (
                <li
                  key={phase.index}
                  id={`timeline-phase-${index + 1}`}
                  aria-current={isActive ? "step" : undefined}
                  className="timeline-chapter relative scroll-mt-28 pb-space-2xl last:pb-space-lg lg:flex lg:min-h-[56vh] lg:items-center lg:pb-space-xl motion-reduce:lg:min-h-0 motion-reduce:lg:pb-space-2xl"
                >
                  <div className="timeline-chapter-content relative grid w-full grid-cols-[40px_minmax(0,1fr)] items-start gap-space-md lg:grid-cols-[48px_minmax(0,1fr)] lg:gap-space-xl">
                    <span className={cn("relative z-10 flex size-10 items-center justify-center rounded-full border text-label-md tabular-nums transition-colors lg:size-12 [letter-spacing:0]", isActive ? "border-primary bg-primary text-pure-white" : "border-border-hairline bg-surface text-primary")}>
                      {index < active ? <Check aria-hidden className="size-4" /> : number(index)}
                    </span>
                    <div className="relative min-w-0 pt-space-lg">
                      <span aria-hidden className={cn(styles.horizontal, "absolute inset-x-0 top-0 text-border-hairline")} />
                      <span aria-hidden className={cn(styles.horizontal, "timeline-chapter-rule absolute inset-x-0 top-0 origin-left text-primary")} />
                      <div className="mb-space-lg flex flex-wrap items-center justify-between gap-space-sm">
                        <span className="flex items-center gap-space-xs text-label-md text-primary [letter-spacing:0]">
                          <Icon aria-hidden className="size-4" strokeWidth={1.7} />
                          {phase.index}
                        </span>
                        {phase.emphasis && <span className="rounded-sm bg-primary-fixed px-space-sm py-space-xs text-label-md text-primary [letter-spacing:0]">Jalur utama</span>}
                      </div>
                      <h3 className="text-[30px] font-semibold leading-tight text-on-surface [letter-spacing:0] sm:text-[40px]">{phase.title}</h3>
                      <div className="my-space-lg flex flex-wrap items-center gap-space-sm">
                        <span className={cn("inline-flex items-center gap-space-xs rounded-sm px-space-sm py-space-xs text-label-lg tabular-nums [letter-spacing:0]", phase.emphasis ? "bg-primary text-pure-white" : "bg-surface-container-low text-primary")}>
                          <Clock3 aria-hidden className="size-4" />{phase.duration}
                        </span>
                        {phase.note && <span className="text-body-sm text-muted-gray">{phase.note}</span>}
                      </div>
                      <p className="max-w-md text-body-md leading-relaxed text-on-surface-variant sm:text-body-lg sm:[letter-spacing:0]">{phase.body}</p>
                      {media && (
                        <div className="relative mt-space-lg aspect-[4/3] overflow-hidden rounded-md bg-surface-container lg:hidden motion-reduce:lg:block motion-reduce:lg:max-w-lg">
                          <Image src={media.src} alt={media.alt} fill loading={isActive ? "eager" : "lazy"} sizes="(min-width: 1024px) 512px, (min-width: 640px) 80vw, 75vw" className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            </ol>
          </div>
        </div>
        <div className="mt-space-xl grid gap-space-md border-t border-border-hairline pt-space-lg lg:grid-cols-12">
          <p className="text-label-md text-primary [letter-spacing:0] lg:col-span-5">Setiap detail, melalui proses yang jelas.</p>
          <p className="max-w-2xl text-body-sm text-muted-gray lg:col-span-7">*{note}</p>
        </div>
      </div>
    </section>
  );
}
