import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { SurveyForm } from "@/components/forms/survey-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import {
  assuranceRows,
  featuredProjects,
  trustPoints,
} from "@/data/savoy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  BeforeAfter,
  FAQList,
  HeroChoreography,
  MaterialSelector,
  ProcessProgress,
  ServiceSelector,
} from "./savoy-interactions";

export function SavoyHome() {
  const heroWhatsapp = buildWhatsAppUrl({ source: "hero" });
  const finalWhatsapp = buildWhatsAppUrl({ source: "final_cta" });

  return (
    <>
      <section className="relative min-h-[96svh] overflow-hidden pt-24">
        <HeroChoreography />
        <div className="container-savoy grid min-h-[calc(96svh-6rem)] items-end gap-10 pb-12 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="z-10 space-y-8 pb-8">
            <p data-hero-line className="meta-savoy text-savoy-espresso">
              SAVOY / Quiet Spatial Luxury
            </p>
            <h1 className="display-savoy max-w-4xl">
              <span data-hero-line className="block">
                Interior yang dirancang
              </span>
              <span data-hero-line className="block">
                untuk cara Anda hidup.
              </span>
            </h1>
            <p data-hero-line className="max-w-xl text-lg leading-8 text-ink-muted">
              Ruang, proporsi, material, dan detail kerja diputuskan dari kondisi
              nyata, bukan dari template visual.
            </p>
            <div data-hero-cta className="flex flex-col gap-3 sm:flex-row">
              <Button href={heroWhatsapp ?? "#planner"}>Konsultasi Proyek</Button>
              <Button href="#projects" variant="outline">
                Lihat Karya
              </Button>
            </div>
          </div>
          <div data-hero-image className="image-well relative min-h-[56svh] shadow-soft">
            <Image
              src="/brand/savoy-brand-plate.png"
              alt="SAVOY brand visual"
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-contain p-10 mix-blend-screen opacity-90"
            />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between border-t border-border-dark pt-4 text-savoy-ivory">
              <span className="meta-savoy">Approved brand visual</span>
              <span className="text-sm text-savoy-ivory/70">Project imagery required</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-savoy">
        <div className="container-savoy grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="space-y-6">
            <p className="meta-savoy text-savoy-gold">Brand Statement</p>
            <h2 className="heading-savoy max-w-4xl">
              Ruang yang baik terasa tenang karena setiap detail memiliki alasan.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-ink-muted">
              SAVOY membangun interior dari urutan keputusan yang jelas: ukuran
              aktual, kebiasaan pengguna, pilihan material, kontrol produksi, dan
              instalasi yang rapi.
            </p>
          </div>
          <div className="image-well min-h-[360px] p-8 text-savoy-ivory">
            <BrandMark asLink={false} />
            <p className="mt-24 max-w-sm text-lg leading-8 text-savoy-ivory/76">
              Close-up material or detail image: PROJECT_DATA_REQUIRED
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border-soft bg-surface-muted py-8">
        <div className="container-savoy grid gap-6 md:grid-cols-4">
          {trustPoints.map((point) => (
            <p key={point} className="text-sm font-semibold leading-6 text-savoy-ink">
              {point}
            </p>
          ))}
        </div>
      </section>

      <section id="projects" className="section-savoy">
        <div className="container-savoy space-y-12">
          <div className="max-w-3xl space-y-4">
            <p className="meta-savoy text-savoy-gold">Featured Projects</p>
            <h2 className="heading-savoy">Project stories need verified SAVOY data.</h2>
          </div>
          <div className="grid gap-10">
            {featuredProjects.map((project, index) => (
              <article
                key={`${project.category}-${index}`}
                className={`grid gap-6 lg:items-end ${
                  index === 1 ? "lg:grid-cols-[0.72fr_1fr]" : "lg:grid-cols-[1.12fr_0.88fr]"
                }`}
              >
                <div
                  className={`image-well grid place-items-center text-savoy-ivory ${
                    project.orientation === "portrait"
                      ? "min-h-[620px]"
                      : project.orientation === "panorama"
                        ? "min-h-[360px]"
                        : "min-h-[520px]"
                  } ${index === 1 ? "lg:order-2" : ""}`}
                >
                  <span className="meta-savoy">PROJECT_DATA_REQUIRED</span>
                </div>
                <div className="space-y-5 border-t border-border-soft pt-5">
                  <p className="meta-savoy text-ink-muted">{project.category}</p>
                  <h3 className="font-display text-4xl font-semibold">{project.name}</h3>
                  <p className="text-sm font-semibold text-ink-muted">{project.location}</p>
                  <dl className="grid gap-4 text-sm leading-6 text-ink-muted">
                    <div>
                      <dt className="font-semibold text-savoy-ink">Challenge</dt>
                      <dd>{project.challenge}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-savoy-ink">Intervention</dt>
                      <dd>{project.intervention}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-savoy-ink">Material</dt>
                      <dd>{project.materials}</dd>
                    </div>
                  </dl>
                  <Button href="#planner" variant="quiet" className="px-0">
                    Lihat Studi Proyek
                    <ArrowRight aria-hidden className="size-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="section-savoy bg-surface-muted">
        <div className="container-savoy grid gap-12 lg:grid-cols-[0.42fr_0.58fr]">
          <div className="space-y-5">
            <p className="meta-savoy text-savoy-gold">Services</p>
            <h2 className="heading-savoy">Built for rooms that are used every day.</h2>
            <p className="text-lg leading-8 text-ink-muted">
              Pilih layanan untuk melihat fokus desainnya. Interaksi kecil memakai
              Motion.dev; tidak perlu GSAP di sini.
            </p>
          </div>
          <ServiceSelector />
        </div>
      </section>

      <section id="process" className="section-savoy">
        <div className="container-savoy">
          <p className="meta-savoy text-savoy-gold">Process</p>
          <h2 className="heading-savoy mt-4 max-w-3xl">
            Enam tahap sebelum ruang menjadi pekerjaan produksi.
          </h2>
          <ProcessProgress />
        </div>
      </section>

      <section id="materials" className="section-savoy bg-surface-muted">
        <div className="container-savoy space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="meta-savoy text-savoy-gold">Material Experience</p>
            <h2 className="heading-savoy">Material is selected, not decorated.</h2>
          </div>
          <MaterialSelector />
        </div>
      </section>

      <section className="section-savoy">
        <div className="container-savoy space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="meta-savoy text-savoy-gold">Before / After</p>
            <h2 className="heading-savoy">Transformation requires real visual proof.</h2>
          </div>
          <BeforeAfter />
        </div>
      </section>

      <section className="section-savoy bg-surface-muted">
        <div className="container-savoy grid gap-12 lg:grid-cols-[0.42fr_0.58fr]">
          <div className="space-y-4">
            <p className="meta-savoy text-savoy-gold">Assurance</p>
            <h2 className="heading-savoy">Sebelum produksi dimulai, semuanya harus jelas.</h2>
          </div>
          <div>
            {assuranceRows.map(([title, text]) => (
              <div key={title} className="grid gap-3 border-b border-border-soft py-6 md:grid-cols-[0.35fr_0.65fr]">
                <h3 className="font-display text-2xl font-semibold">{title}</h3>
                <p className="text-base leading-7 text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-savoy">
        <div className="container-savoy grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div className="image-well min-h-[420px]" />
          <div className="space-y-5">
            <p className="meta-savoy text-savoy-gold">Testimonial</p>
            <blockquote className="heading-savoy">TESTIMONIAL_DATA_REQUIRED</blockquote>
            <p className="text-base text-ink-muted">
              Client identifier, location, and project image must be verified before publication.
            </p>
          </div>
        </div>
      </section>

      <section className="section-savoy bg-surface-muted">
        <div className="container-savoy space-y-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="meta-savoy text-savoy-gold">FAQ</p>
            <h2 className="heading-savoy mt-4">Pertanyaan sebelum konsultasi.</h2>
          </div>
          <FAQList />
        </div>
      </section>

      <section id="planner" className="section-savoy">
        <div className="container-savoy grid gap-10 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
          <div className="sticky top-28 space-y-5">
            <p className="meta-savoy text-savoy-gold">Consultation Planner</p>
            <h2 className="heading-savoy">Mulai dengan ruang, bukan asumsi.</h2>
            <p className="text-lg leading-8 text-ink-muted">
              Empat langkah singkat untuk memahami ruang, lingkup, lokasi, dan kontak Anda.
            </p>
            <div className="image-well min-h-[260px] p-6 text-savoy-ivory">
              <p className="meta-savoy text-savoy-gold">Planner visual</p>
              <p className="mt-24 max-w-sm text-sm leading-6 text-savoy-ivory/72">
                BUSINESS_DATA_REQUIRED for verified contact destination.
              </p>
            </div>
          </div>
          <div className="border-y border-border-soft py-8">
            <SurveyForm />
          </div>
        </div>
      </section>

      <section className="bg-savoy-obsidian py-24 text-savoy-ivory">
        <div className="container-savoy grid gap-8 lg:grid-cols-[1fr_0.36fr] lg:items-end">
          <div className="space-y-5">
            <p className="meta-savoy text-savoy-gold">Final CTA</p>
            <h2 className="heading-savoy">Mari mulai dari ruang yang Anda miliki.</h2>
            <p className="max-w-xl text-lg leading-8 text-savoy-ivory/72">
              Bawa ukuran, foto, atau cerita singkat tentang ruang Anda. SAVOY akan
              membantu menyusun langkah berikutnya.
            </p>
          </div>
          <Button href={finalWhatsapp ?? "#planner"} variant="outline" className="border-border-dark text-savoy-ivory hover:border-savoy-ivory">
            Konsultasi Proyek
          </Button>
        </div>
      </section>
    </>
  );
}
