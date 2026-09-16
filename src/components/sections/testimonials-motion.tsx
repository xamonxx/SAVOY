"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";
import { MessageSquarePlus, Star } from "lucide-react";

import { ReviewForm } from "@/components/forms/review-form";
import { Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { duration, easeOutEditorial } from "@/components/motion/tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const gsapEase = `cubic-bezier(${easeOutEditorial.join(",")})`;

export type TestimonialMotionItem = {
  id: string;
  quote: string;
  author: string;
  context: string;
  rating: number;
  isPublicSubmission: boolean;
};

function Stars({ rating, size = "sm" }: { rating: number; size?: "lg" | "sm" }) {
  return (
    <span aria-label={`${rating} dari 5 bintang`} className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            size === "lg" ? "size-4 sm:size-5" : "size-3.5",
            index < rating
              ? "fill-primary-container text-primary-container"
              : "fill-transparent text-border-hairline-strong"
          )}
        />
      ))}
    </span>
  );
}

export function TestimonialsMotion({ items }: { items: TestimonialMotionItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [featured, ...rest] = items;

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".testimonials-heading", {
        y: 22,
        opacity: 0.72,
        duration: duration.editorial,
        ease: gsapEase,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
        },
      });

      gsap.from(".testimonial-card", {
        y: 34,
        opacity: 0.72,
        stagger: 0.08,
        duration: duration.editorial,
        ease: gsapEase,
        scrollTrigger: {
          trigger: ".testimonials-grid",
          start: "top 76%",
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  if (!featured) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-surface-container-low py-space-4xl"
    >
      <div className="container-editorial relative">
        <div className="testimonials-heading mb-space-2xl grid gap-space-lg xl:grid-cols-12 xl:items-end">
          <div className="max-w-2xl space-y-space-xs xl:col-span-7">
            <Eyebrow>Kata mereka tentang SAVOY</Eyebrow>
            <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              Dipercaya untuk mengisi ruang paling berharga.
            </h2>
          </div>
          <div className="flex items-start gap-space-sm xl:col-span-4 xl:col-start-9 xl:justify-end">
            <span
              aria-hidden
              className="mt-1 hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary sm:flex"
            >
              <MessageSquarePlus className="size-4" />
            </span>
            <div className="space-y-space-sm">
              <p className="max-w-md text-body-sm text-on-surface-variant">
                Ulasan pelanggan dibuat mudah dibaca: satu cerita utama, lalu bukti
                sosial lain yang tetap ringan untuk dipindai.
              </p>
              <ReviewForm />
            </div>
          </div>
        </div>

        <div className="testimonials-grid grid gap-space-md xl:grid-cols-12">
          <motion.article
            className="testimonial-card relative overflow-hidden rounded-lg bg-surface-container-lowest p-space-lg shadow-panel sm:p-space-2xl xl:col-span-7"
            whileHover={reducedMotion ? undefined : { y: -6 }}
            transition={{ duration: duration.micro, ease: easeOutEditorial }}
          >
            <span
              aria-hidden
              className="absolute -left-3 -top-12 select-none text-[150px] font-bold leading-none text-primary-container/12 sm:text-[220px]"
            >
              &rdquo;
            </span>
            <div className="relative space-y-space-md">
              <div className="flex flex-wrap items-center gap-space-sm">
                <Stars rating={featured.rating} size="lg" />
                <span className="rounded-full bg-primary-fixed px-space-sm py-space-2xs text-label-md font-bold text-primary">
                  Ulasan utama
                </span>
              </div>
              <blockquote className="max-w-4xl text-headline-sm font-semibold leading-snug text-on-surface sm:text-headline-md">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <footer className="border-t border-border-hairline pt-space-md">
                <p className="text-label-lg font-bold text-on-surface">
                  {featured.author}
                </p>
                <p className="text-body-sm text-muted-gray">{featured.context}</p>
              </footer>
            </div>
          </motion.article>

          {rest.length > 0 ? (
            <div className="grid gap-space-md sm:grid-cols-2 xl:col-span-5 xl:grid-cols-1">
              {rest.map((testimonial) => (
                <motion.article
                  key={testimonial.id}
                  className="testimonial-card flex flex-col justify-between gap-space-md rounded-lg border border-border-hairline bg-surface-container-lowest p-space-md shadow-hairline sm:p-space-lg"
                  whileHover={reducedMotion ? undefined : { y: -5 }}
                  transition={{ duration: duration.micro, ease: easeOutEditorial }}
                >
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between gap-space-sm">
                      <Stars rating={testimonial.rating} />
                      {testimonial.isPublicSubmission ? (
                        <span className="text-label-md font-semibold text-primary">
                          Publik
                        </span>
                      ) : null}
                    </div>
                    <blockquote className="text-body-sm leading-relaxed text-on-surface-variant">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                  </div>
                  <footer>
                    <p className="text-label-md font-bold text-on-surface">
                      {testimonial.author}
                    </p>
                    <p className="text-body-sm text-muted-gray">{testimonial.context}</p>
                  </footer>
                </motion.article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
