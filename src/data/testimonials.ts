/**
 * ⚠ PLACEHOLDER DATA - NOT REAL CLIENT QUOTES ⚠
 *
 * Every entry below is generated sample copy written to exercise the layout.
 * The names are invented and none of these people said any of this.
 *
 * Guard rails:
 *   - each entry is flagged `isPlaceholder: true`
 *   - `visibleTestimonials` returns nothing in production while the flag is set
 *
 * To go live: replace these with real, attributable quotes (with the client's
 * permission), set `isPlaceholder: false` on each, and set
 * NEXT_PUBLIC_SHOW_TESTIMONIALS=true.
 */

import { site } from "@/lib/site";
import type { Testimonial } from "@/types";

export const testimonials: Testimonial[] = [
  {
    id: "sample-1",
    quote:
      "Dari awal konsultasi sampai pemasangan, alurnya jelas dan komunikasinya enak. Ukuran kitchen set dibuat presisi mengikuti ruangan, hasil akhirnya rapi, kokoh, dan area kerja ditinggalkan bersih.",
    author: "Ibu Rina Paramita",
    context: "Kitchen Set - Bandung",
    isPlaceholder: true,
  },
  {
    id: "sample-2",
    quote:
      "Saya merasa lebih tenang karena desain, pilihan material, dan estimasi waktu dijelaskan sebelum produksi. Saat terpasang, lemari sesuai dengan visual yang disetujui dan detail finishingnya terasa premium.",
    author: "Bapak Ardi Wijaya",
    context: "Lemari Pakaian - Cimahi",
    isPlaceholder: true,
  },
  {
    id: "sample-3",
    quote:
      "Tim SAVOY memberi solusi yang masuk akal untuk ruang bawah tangga kami. Setiap sudut dimanfaatkan tanpa terlihat penuh, bukaan pintunya halus, dan hasilnya menyatu dengan interior rumah.",
    author: "Ibu Maya Larasati",
    context: "Lemari Bawah Tangga - Jakarta Selatan",
    isPlaceholder: true,
  },
  {
    id: "sample-4",
    quote:
      "Yang membuat saya percaya adalah prosesnya transparan. Jika ada penyesuaian di lapangan, selalu dikabari dulu, lalu setelah selesai tetap dibantu pengecekan detail sampai semuanya nyaman dipakai.",
    author: "Keluarga Pratama",
    context: "Kabinet Custom - Bekasi",
    isPlaceholder: true,
  },
];

/** True when nothing but sample copy is available. */
export const testimonialsArePlaceholder = testimonials.every(
  (testimonial) => testimonial.isPlaceholder
);

/**
 * Testimonials safe to render right now.
 *
 * Audit SAV-014: this used to check `testimonialsArePlaceholder` and return
 * the *entire* array either way - the moment even one real testimonial gets
 * added alongside the four samples, `.every()` turns false and every
 * remaining placeholder starts shipping to production with it. Production
 * now filters per record instead of trusting an all-or-nothing flag.
 * Placeholder quotes are still visible in development (or with
 * `NEXT_PUBLIC_SHOW_TESTIMONIALS=true`) so the layout can be reviewed before
 * any real quotes exist.
 */
export function visibleTestimonials(): Testimonial[] {
  if (site.showTestimonials) return testimonials;
  if (process.env.NODE_ENV === "development") return testimonials;
  return testimonials.filter((testimonial) => !testimonial.isPlaceholder);
}
