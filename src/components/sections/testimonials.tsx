import { MessageSquarePlus } from "lucide-react";

import {
  TestimonialsMotion,
  type TestimonialMotionItem,
} from "@/components/sections/testimonials-motion";
import { Eyebrow } from "@/components/ui/typography";
import { ReviewForm } from "@/components/forms/review-form";
import { visibleTestimonials } from "@/data/testimonials";
import { getPublicReviews } from "@/lib/reviews";

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

  const formattedPublic: TestimonialMotionItem[] = publicReviews.map((r) => ({
    id: r.id,
    quote: r.description,
    author: r.author,
    context: r.address,
    rating: r.rating,
    isPublicSubmission: true,
  }));

  const formattedBaseline: TestimonialMotionItem[] = baseline.map((t) => ({
    id: t.id,
    quote: t.quote,
    author: t.author,
    context: t.context,
    rating: 5,
    isPublicSubmission: false,
  }));

  const items = [...formattedPublic, ...formattedBaseline];

  // Audit SAV-013: this used to `return null` here, and the only
  // `<ReviewForm />` mount point lived inside `TestimonialsMotion` - which
  // *also* returns null on an empty list. With zero reviews and testimonials
  // hidden (the real production starting state), nobody could ever open the
  // form to submit the first one. This empty state keeps the trigger
  // reachable without rendering an empty carousel around it.
  if (items.length === 0) {
    return (
      <section className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial flex flex-col items-center gap-space-md text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <MessageSquarePlus className="size-5" />
          </span>
          <div className="space-y-space-xs">
            <Eyebrow>Kata mereka tentang SAVOY</Eyebrow>
            <h2 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
              Jadilah yang pertama membagikan pengalaman Anda.
            </h2>
            <p className="mx-auto max-w-md text-body-sm text-on-surface-variant">
              Belum ada ulasan publik yang tampil di sini. Ceritakan pengalaman Anda
              bekerja sama dengan tim SAVOY.
            </p>
          </div>
          <ReviewForm />
        </div>
      </section>
    );
  }

  return <TestimonialsMotion items={items} />;
}
