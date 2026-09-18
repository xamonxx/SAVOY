import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HeroFrames } from "@/components/motion/hero-frames";
import { HeroHeadline } from "@/components/motion/hero-headline";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { Reveal } from "@/components/motion/reveal";
import {
  heroProject,
  heroSlides,
  photoCount,
  populatedCategories,
  projectCount,
  servedLocations,
} from "@/data/projects";
import { site } from "@/lib/site";

/**
 * Section 01 - Hero.
 *
 * A single full-window photograph with the offer standing on top of it. The
 * frames cross-dissolve and drift with the scroll, so the first screen is the
 * work itself rather than a picture placed beside a description of it.
 *
 * The floating "Studio & Workshop" badge is gone. In its place is a proof bar
 * built from the portfolio data itself, so the first screen carries verifiable
 * numbers instead of a decorative label.
 */
export function Hero() {
  const caption = [heroProject.location, heroProject.categoryShort]
    .filter(Boolean)
    .join(" · ");

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
        <ParallaxMedia distance={60} className="mx-auto w-full max-w-2xl text-center lg:max-w-[46rem]">
          <HeroHeadline className="text-display-mobile text-inverse-on-surface [text-shadow:0_4px_24px_rgba(9,11,13,0.45)] sm:text-5xl sm:leading-[1.12] md:text-6xl md:leading-[1.1] lg:text-display">
            Setiap sudut ruang, dirancang untuk cara Anda{" "}
            <span className="text-primary-container">hidup</span>.
          </HeroHeadline>

          <Reveal delay={1}>
            <p className="mx-auto mt-space-sm sm:mt-space-md max-w-2xl text-body-md sm:text-body-lg leading-relaxed text-inverse-on-surface/85 [text-shadow:0_2px_12px_rgba(9,11,13,0.4)]">
              {site.name}: diukur presisi, dirancang sesuai kebiasaan Anda,
              dan dikerjakan penuh di workshop sendiri — dari konsultasi
              hingga pemasangan, tanpa kompromi.
            </p>
          </Reveal>

          <Reveal delay={2}>
            {/*
              A one-column grid until `sm`, a centered row after it.

              As a wrapping flex row the two buttons sized to their own labels,
              so on a phone they stacked at 301px and 230px - two
              differently-sized buttons, which reads as a mistake rather than
              a pair. Grid items stretch, so stacked they always match.

              `items-stretch` on the row is for the other axis: the outline
              button carries a 1px border the filled one does not, so side by
              side they stand 46px and 44px unless something makes them agree.
            */}
            <div className="mt-space-md grid gap-space-sm sm:flex sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-space-md">
              {/*
                Narrower padding while the buttons are full width, the size's
                own `px-space-xl` back once they size to their labels again.

                Padding is what sets the width of an auto-width button and dead
                weight on a stretched one, where it only eats into the room the
                label has. At 320px it left 190px for a label needing 200, so
                "Konsultasikan Ruangan Anda" wrapped and stood 64px against its
                46px neighbour.
              */}
              <WhatsAppCta
                source="hero"
                className="px-space-md sm:px-space-xl"
              >
                Konsultasikan Ruangan Anda
              </WhatsAppCta>
              <Button
                href="/portfolio"
                variant="outline-inverse"
                className="px-space-md sm:px-space-xl"
              >
                Lihat Portofolio Proyek
              </Button>
            </div>
          </Reveal>

          {/* Proof bar. Every number is counted from the published portfolio,
              so it cannot drift away from what the site actually shows. */}
          <Reveal delay={3}>
            <dl className="mx-auto mt-space-md sm:mt-space-lg grid max-w-xl grid-cols-2 gap-x-space-md gap-y-space-sm border-t border-border-hairline-dark pt-space-sm sm:pt-space-md sm:grid-cols-4 sm:max-w-none lg:gap-x-space-md">
              {proof.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd>
                    <span className="block text-2xl font-semibold text-inverse-on-surface sm:text-headline-md-mobile lg:text-headline-md">
                      {item.value}
                    </span>
                    {/*
                      The cap keeps the captions honest in the four-column
                      layout, and it has to stay scoped to `sm`. Below that
                      there are two columns of about 154px, where an unscoped
                      cap squeezed them to 77px - wrapping every label onto a
                      second line for no reason and making the proof bar 34px
                      taller than it needed to be. `mx-auto` centers the capped
                      line under its number now that the column itself centers.
                    */}
                    <span className="mx-auto mt-space-2xs block text-label-eyebrow uppercase leading-snug text-inverse-on-surface/70 sm:max-w-[12ch]">
                      {item.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </ParallaxMedia>
      </div>

      {/* Credit for the photograph, moved to the right so it never collides
          with the text column. */}
      {caption ? (
        <span className="absolute bottom-0 right-0 bg-scrim-black/80 px-space-md py-space-xs text-label-eyebrow uppercase text-pure-white backdrop-blur-sm">
          {caption}
        </span>
      ) : null}
    </section>
  );
}
