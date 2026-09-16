import {
  TestimonialsMotion,
  type TestimonialMotionItem,
} from "@/components/sections/testimonials-motion";
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
  if (items.length === 0) return null;

  return <TestimonialsMotion items={items} />;
}
