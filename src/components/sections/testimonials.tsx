import { Star } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/typography";
import { visibleTestimonials } from "@/data/testimonials";
import { getPublicReviews } from "@/lib/reviews";
import { ReviewForm } from "@/components/forms/review-form";
import { cn } from "@/lib/cn";

/**
 * Section 12 - Client testimonials & public reviews.
 *
 * Renders verified public reviews alongside client testimonials.
 * Includes a public review submission form where clients can submit their
 * rating, critique, suggestions, name, and address.
 */
export async function Testimonials() {
  const publicReviews = await getPublicReviews();
  const baseline = visibleTestimonials();

  const formattedPublic = publicReviews.map((r) => ({
    id: r.id,
    quote: r.description,
    author: r.author,
    context: r.address,
    rating: r.rating,
    isPublicSubmission: true,
  }));

  const formattedBaseline = baseline.map((t) => ({
    id: t.id,
    quote: t.quote,
    author: t.author,
    context: t.context,
    rating: 5,
    isPublicSubmission: false,
  }));

  const items = [...formattedPublic, ...formattedBaseline];
  if (items.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-space-4xl">
      <div className="container-editorial">
        <div className="mb-space-2xl space-y-space-md">
          <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
            <Reveal>
              <div className="max-w-2xl space-y-space-xs">
                <Eyebrow>Kata mereka tentang SAVOY</Eyebrow>
                <h2 className="text-headline-lg-mobile text-on-surface lg:text-headline-lg">
                  Dipercaya untuk mengisi ruang paling berharga.
                </h2>
              </div>
            </Reveal>
          </div>

          <Reveal delay={1}>
            <ReviewForm />
          </Reveal>
        </div>

        <RevealGroup as="ul" className="grid grid-cols-2 gap-space-sm sm:gap-gutter-desktop md:grid-cols-2">
          {items.map((testimonial) => (
            <RevealItem
              as="li"
              key={testimonial.id}
              className="flex flex-col justify-between gap-space-sm rounded-md bg-surface-container-lowest p-space-sm shadow-hairline sm:gap-space-md sm:p-space-xl"
            >
              <div className="space-y-space-xs sm:space-y-space-sm">
                <span
                  aria-hidden
                  className="flex gap-0.5"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        "size-3 sm:size-5",
                        index < testimonial.rating
                          ? "fill-current text-primary-container"
                          : "fill-transparent text-border-hairline-strong"
                      )}
                    />
                  ))}
                </span>
                <blockquote className="text-xs sm:text-body-lg italic leading-relaxed text-on-surface">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              </div>
              <footer className="pt-space-xs sm:pt-space-sm">
                <p className="text-xs sm:text-label-lg font-bold text-on-surface">
                  {testimonial.author}
                </p>
                <p className="text-[10px] sm:text-body-sm text-muted-gray">
                  {testimonial.context}
                </p>
              </footer>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
