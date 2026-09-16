import { Reveal } from "@/components/motion/reveal";
import { ProcessStorytelling } from "@/components/sections/process-storytelling";
import { ProcessBackdrop } from "@/components/sections/process-backdrop";
import { Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { processSteps } from "@/data/content";
import { processImages } from "@/data/projects";
import { cn } from "@/lib/cn";
import styles from "./process-storytelling.module.css";

/** Section 08 - Order process. */
export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className={cn(styles.section, "scroll-mt-24 py-space-3xl text-pure-white [letter-spacing:0] lg:py-space-4xl")}>
      <ProcessBackdrop />
      <div className={cn(styles.content, "container-editorial")}>
        <div className="mb-space-2xl grid gap-space-lg lg:mb-space-3xl lg:grid-cols-12 lg:items-end">
          <div className="space-y-space-md lg:col-span-8">
            <Eyebrow tone="onDark" className="[letter-spacing:0]">Alur kerja terstruktur</Eyebrow>
            <h2 id="process-title" className="max-w-3xl text-[32px] font-semibold leading-tight sm:text-[42px] lg:text-[48px]">
              Dari percakapan pertama hingga ruang siap digunakan.
            </h2>
          </div>
          <p className="max-w-sm text-body-md leading-relaxed text-pure-white/75 lg:col-span-4">
            Setiap tahapan dikelola secara transparan dengan dokumentasi spesifikasi teknis yang jelas.
          </p>
        </div>

        <ProcessStorytelling steps={processSteps} images={processImages} />

        <Reveal className="mt-space-3xl">
          <div className="flex flex-col items-start justify-between gap-space-lg border-t border-pure-white/15 pt-space-xl sm:flex-row sm:items-center">
            <div className="space-y-1">
              <p className="text-headline-sm font-semibold text-pure-white [letter-spacing:0]">
                Siap mendiskusikan ruangan Anda?
              </p>
              <p className="text-body-sm text-pure-white/75">
                Konsultasi awal &amp; estimasi perkiraan tidak dikenakan biaya.
              </p>
            </div>
            <WhatsAppCta source="process" className="shrink-0">
              Mulai dari Konsultasi Gratis
            </WhatsAppCta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
