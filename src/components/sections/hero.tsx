import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HeroFrames } from "@/components/motion/hero-frames";
import { HeroHeadline } from "@/components/motion/hero-headline";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import {
  heroSlides,
  photoCount,
  populatedCategories,
  projectCount,
  servedLocations,
} from "@/data/projects";


/**
 * Section 01 - Hero.
 *
 * A full-window photograph with the offer standing on top of it, cross-
 * dissolving between a mix of categories (`heroSlides`) so the first screen
 * reads as studio range rather than one job on repeat - no per-frame credit
 * badge, since a single "location · category" caption stopped being true for
 * every frame once the categories started mixing.
 *
 * The floating "Studio & Workshop" badge is gone. In its place is a proof bar
 * built from the portfolio data itself, so the first screen carries verifiable
 * numbers instead of a decorative label.
 */
export function Hero() {
  const proof = [
    { value: projectCount, label: "Proyek terdokumentasi" },
    { value: photoCount, label: "Foto pengerjaan" },
    { value: servedLocations.length, label: "Kota & area" },
    { value: populatedCategories.length, label: "Kategori pengerjaan" },
  ];

  return (
    // `-mt-20` cancels the 5rem `main` gives every page to clear the fixed
    // header: this hero runs underneath it instead, which is the whole point of
    // a transparent bar. The content below adds that 5rem back as padding.
    //
    // `min-h` rather than a fixed height: the hero is exactly one screen tall
    // in every ordinary case, and grows instead of clipping the proof bar on a
    // short window or at large text sizes.
    <section className="relative isolate -mt-20 flex min-h-[100dvh] items-center overflow-hidden bg-scrim-black">
      <ParallaxMedia distance={40} className="absolute inset-0">
        <HeroFrames images={heroSlides} sizes="100vw" />
      </ParallaxMedia>

      {/*
        Centered composition: one radial vignette instead of the old
        left-to-right scrim, since the type no longer tracks a fixed-width
        left column at `lg` - it sits in the middle of the frame at every
        width, so the darkened area only needs to follow it there. Holds
        white body text above 4.5:1 even where a frame is at its brightest.

        `--color-scrim-black`, not `--color-deep-black`: this darkens the
        photograph for legibility, it does not recolor it - the brand's dark
        green belongs on solid sections (Process, the footer card), never as
        a tint over photography.
      */}
      <div aria-hidden className="absolute inset-0 bg-scrim-black/35 lg:hidden" />
      {/*
        The header floats over this section with no surface of its own. This
        band is what keeps it legible: heavy across the 5rem bar, gone by the
        time the headline starts.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-scrim-black/92 via-scrim-black/80 via-50% to-transparent lg:block"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-[radial-gradient(ellipse_65%_55%_at_50%_55%,color-mix(in_srgb,var(--color-scrim-black)_82%,transparent),color-mix(in_srgb,var(--color-scrim-black)_55%,transparent)_55%,color-mix(in_srgb,var(--color-scrim-black)_15%,transparent)_100%)] lg:block"
      />

      <div className="container-editorial relative w-full pb-space-xl pt-[calc(5rem+var(--spacing-space-md))] sm:pb-space-2xl">
        {/*
          Text drifts a little further than the photograph behind it
          (`ParallaxMedia` on the frames above runs at 40px) - the gap
          between the two speeds is what reads as depth rather than the
          whole frame moving as one flat plane.
        */}
        <div className="mx-auto w-full max-w-3xl text-center md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
          <HeroHeadline className="mx-auto text-balance text-display-mobile text-inverse-on-surface [text-shadow:0_4px_30px_rgba(0,0,0,0.5)] sm:text-5xl sm:leading-[1.14] md:text-6xl md:leading-[1.1] lg:text-[64px] lg:leading-[1.08] xl:text-[72px] xl:leading-[1.06]">
            Desain interior &amp; furnitur custom{" "}
            <br className="hidden md:inline" />
            dengan presisi{" "}
            <span className="text-primary-container [text-shadow:0_0_30px_rgba(130,156,103,0.55)]">
              tanpa kompromi
            </span>
            .
          </HeroHeadline>

          <p className="mx-auto mt-space-sm sm:mt-space-md max-w-2xl text-body-md sm:text-body-lg leading-relaxed text-inverse-on-surface/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
            Furnitur custom dan interior yang dibuat presisi sesuai kebiasaan Anda. Fabrikasi langsung di workshop sendiri, terpasang rapi, bergaransi resmi, dan tanpa perantara.
          </p>

          <div className="mt-space-md sm:mt-space-lg flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <WhatsAppCta
              source="hero"
              className="w-full sm:w-auto rounded-full px-8 py-3.5 text-label-lg font-semibold shadow-[0_8px_25px_-6px_rgba(130,156,103,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.4)] hover:brightness-105 active:scale-[0.96] transition-all duration-200"
            >
              Konsultasikan Ruangan Anda
            </WhatsAppCta>
            <Button
              href="/portfolio"
              variant="outline-inverse"
              className="liquid-glass-btn w-full sm:w-auto rounded-full px-8 py-3.5 text-label-lg font-semibold text-white active:scale-[0.96]"
            >
              Lihat Portofolio Proyek
              <ArrowUpRight aria-hidden className="size-4 opacity-80" />
            </Button>
          </div>

          {/* Proof bar - Apple Liquid Glass Dock */}
          <div className="liquid-glass mx-auto mt-space-lg sm:mt-space-xl max-w-3xl rounded-3xl p-4 sm:p-5">
            <dl className="grid grid-cols-2 gap-y-4 divide-y divide-white/10 sm:grid-cols-4 sm:gap-y-0 sm:divide-y-0 sm:divide-x sm:divide-white/15">
              {proof.map((item) => (
                <div key={item.label} className="px-3 pt-2 text-center sm:pt-0">
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <span className="block text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px] [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
                      {item.value}
                    </span>
                    <span className="mx-auto mt-1 block text-[11px] font-semibold uppercase tracking-[0.08em] leading-snug text-white/75 sm:max-w-[12ch]">
                      {item.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
