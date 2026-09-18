import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { ClosingCtaBackdrop } from "@/components/sections/closing-cta-backdrop";
import { cn } from "@/lib/cn";
import styles from "./closing-cta.module.css";

/**
 * Section 17 - Final closing statement.
 *
 * The page's second dark beat (pasal: redesign rhythm plan). `Process` owns
 * obsidian mid-page; this closes the page on a distinct, warmer espresso so
 * the two dark sections read as different chapters rather than a repeat -
 * and so the page's last impression isn't the flattest section on it, right
 * after the much louder gold `CtaBanner`. The sideboard rendered behind the
 * copy is the same scroll-driven, lit three.js treatment `Process` uses for
 * its own cabinet, bookending the page's two dark sections with one visual
 * language. It runs large and left of centre now, so the copy sits in its
 * own column on the right rather than centered on top of it - a split hero
 * beat to close on, instead of a repeat of every centered-text section above
 * it.
 */
export function ClosingCta() {
  return (
    <section className={cn(styles.section, "bg-espresso-deep py-space-5xl")}>
      <ClosingCtaBackdrop />
      <div className={cn(styles.content, "container-editorial")}>
        <div className="space-y-space-md text-center lg:ml-auto lg:max-w-2xl lg:text-left">
          <Reveal>
            <span className="inline-flex items-center text-label-eyebrow uppercase text-primary-container">
              Interior & Furniture Custom SAVOY
            </span>
          </Reveal>
          <Reveal delay={1}>
            {/* `headline-lg` at desktop, not `display`: 80px was sized for a
                full-width centered hero, and wrapped into an oversized,
                heavy block once the copy moved into its own ~42rem column. */}
            <h2 className="mx-auto text-display-mobile text-inverse-on-surface lg:mx-0 lg:text-headline-lg">
              Ruang yang lebih baik dimulai dari perencanaan yang lebih baik.
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mx-auto max-w-xl text-body-lg leading-relaxed text-inverse-on-surface/75 lg:mx-0">
              Jadikan rumah Anda tempat yang tidak hanya nyaman dipandang, tetapi juga
              bekerja sempurna untuk keluarga setiap hari.
            </p>
          </Reveal>
          <Reveal delay={3}>
            {/* `flex-nowrap`: the column is wide enough now that these two
                should sit level, side by side - wrapping was a symptom of
                the column being too narrow, not something to design around. */}
            <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-md lg:flex-nowrap lg:justify-start">
              <WhatsAppCta source="final_cta" className="shrink-0">
                Mulai Konsultasi Ruang Sekarang
              </WhatsAppCta>
              {/* `outline-inverse`, not `surface`: the same translucent-glass
                  treatment the hero already uses for a button standing on a
                  dark ground, reused rather than reinvented for this section's
                  own dark background. */}
              <Button href="/portfolio" variant="outline-inverse" className="shrink-0">
                Lihat Karya Sebelumnya
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
