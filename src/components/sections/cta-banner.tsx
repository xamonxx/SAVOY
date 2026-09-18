import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { Reveal } from "@/components/motion/reveal";
import { CtaBannerDecor } from "@/components/sections/cta-banner-decor";
import { cn } from "@/lib/cn";

/**
 * Section 14 - Primary call to action.
 *
 * Deep forest green, not the light sage fill this used to be: the copy is
 * set in clean white, and white on a light background doesn't hold - it
 * needed a genuinely dark ground, the same family `Process` and `ClosingCta`
 * already use elsewhere, with just enough sage mixed into the top stop to
 * keep this section legible as the same brand colour rather than a plain
 * switch to black. `to bottom`, not `radial`: an ellipse's 100% stop lands
 * at its farthest corner, not reliably at the box's bottom-center edge,
 * which is what left a visible seam against the curve piece below it before.
 */
export function CtaBanner({
  reserveCurveSpace = true,
}: {
  reserveCurveSpace?: boolean;
}) {
  return (
    <section
      className={cn(
        // overflow-x-clip, not overflow-visible: the curve below is 130vw wide
        // so its arc reads shallow, and left unclipped it pushed the whole
        // document 224px wider than the viewport and put a horizontal
        // scrollbar on every page carrying this banner. `clip` on one axis
        // keeps `visible` on the other, so the curve still spills downwards.
        "relative isolate overflow-x-clip overflow-y-visible bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--color-primary)_88%,var(--color-primary-container))_0%,var(--color-primary)_100%)] pb-[calc(var(--spacing-space-4xl)+var(--spacing-space-2xl))] pt-space-4xl text-pure-white",
        reserveCurveSpace && "mb-20 sm:mb-24 lg:mb-28",
      )}
    >
      <CtaBannerDecor />
      <div className="container-editorial relative z-10 space-y-space-md text-center">
        <Reveal>
          <span className="block text-label-eyebrow font-bold uppercase text-pure-white/85">
            Mulai sekarang
          </span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mx-auto max-w-3xl text-display-mobile text-pure-white lg:text-display">
            Punya ruang yang ingin Anda wujudkan?
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mx-auto max-w-2xl text-body-lg leading-relaxed text-pure-white/80">
            Ceritakan kebutuhan Anda. Mulai dari ruang, fungsi, dan apa yang ingin
            dicapai. Tim kami siap membantu dari sketsa awal hingga ruangan siap
            ditempati.
          </p>
        </Reveal>
        <Reveal delay={3}>
          <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-md">
            {/* `primary` (sage), not `dark`: the section's own ground is dark
                green now, and the "dark" variant would all but disappear
                against it. */}
            <WhatsAppCta source="final_cta" variant="primary">
              Konsultasi via WhatsApp
            </WhatsAppCta>
            <Button
              href="/survey"
              // `bg-none` first: the `primary` variant paints a
              // `background-image` gradient, which CSS always renders over a
              // plain `background-color` regardless of class order - without
              // clearing it, `bg-pure-white` compiles into the stylesheet but
              // never actually shows.
              className="bg-none bg-pure-white text-deep-black hover:bg-surface-container-low"
            >
              Ajukan Jadwal Survey
            </Button>
          </div>
        </Reveal>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full z-0 h-20 w-[130vw] -translate-x-1/2 rounded-b-[50%] bg-primary sm:h-24 lg:h-28"
      />
    </section>
  );
}
