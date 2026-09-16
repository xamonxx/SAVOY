import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  CalendarCheck,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Eyebrow } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import {
  serviceAreas,
  getServiceAreaBySlug,
  getAllServiceAreaSlugs,
} from "@/data/service-areas";
import { getAllArticles } from "@/lib/articles";
import {
  ORGANISATION_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import type { KnowledgeArticle } from "@/types";

export const dynamicParams = true;

export function generateStaticParams() {
  return getAllServiceAreaSlugs().map((slug) => ({ slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const area = getServiceAreaBySlug(slug);

  if (!area) {
    return buildMetadata({
      title: "Area Layanan Tidak Ditemukan",
      description: "Halaman area layanan yang Anda cari tidak tersedia.",
      path: `/services/${slug}`,
    });
  }

  return buildMetadata({
    title: area.seoTitle,
    description: area.seoDescription,
    path: `/services/${area.slug}`,
  });
}

function serviceAreaJsonLd(area: ReturnType<typeof getServiceAreaBySlug>) {
  if (!area) return null;

  return jsonLdGraph(
    webPageJsonLd({
      path: `/services/${area.slug}`,
      name: area.name,
      description: area.seoDescription,
      breadcrumb: true,
    }),
    {
      "@type": "Service",
      "@id": `${absoluteUrl(`/services/${area.slug}`)}#service`,
      name: area.name,
      serviceType: "Custom Furniture & Interior Design",
      provider: { "@id": ORGANISATION_ID },
      areaServed: {
        "@type": "AdministrativeArea",
        name: area.city,
      },
      description: area.lead,
      url: absoluteUrl(`/services/${area.slug}`),
    },
    breadcrumbJsonLd([
      { name: "Layanan Area", path: "/services" },
      { name: area.name, path: `/services/${area.slug}` },
    ])
  );
}

export default async function ServiceAreaPage({ params }: Props) {
  const { slug } = await params;
  const area = getServiceAreaBySlug(slug);

  if (!area) {
    notFound();
  }

  // Get articles published under this area category
  const allArticles = await getAllArticles();
  const areaArticles = allArticles.filter(
    (article) => article.category.trim().toLowerCase() === area.name.trim().toLowerCase()
  );

  const otherAreas = serviceAreas.filter((item) => item.slug !== area.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(serviceAreaJsonLd(area))}
      />

      <PageHeader
        eyebrow={`Layanan Area • ${area.city}`}
        title={area.headline}
        lead={area.lead}
      />

      {/* Area Highlights & Fast CTA */}
      <section className="border-b border-border-hairline bg-surface py-space-3xl">
        <div className="container-editorial">
          <div className="grid gap-gutter-desktop lg:grid-cols-12 lg:items-center">
            <div className="space-y-space-md lg:col-span-7">
              <Eyebrow>Jangkauan & Keunggulan Layanan</Eyebrow>
              <h2 className="text-headline-sm font-semibold text-on-surface">
                Solusi interior & custom furniture langsung dari workshop sendiri.
              </h2>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                Setiap hunian memiliki kebutuhan tata ruang yang berbeda. Tim SAVOY
                Furniture hadir langsung ke lokasi Anda di {area.city} untuk survey dimensi
                presisi, diskusi material tahan lembab (HMR & plywood), hingga simulasi
                desain 3D sebelum proses produksi dimulai.
              </p>

              {/* Coverage Pills */}
              <div className="pt-space-xs">
                <span className="block text-label-xs font-semibold uppercase tracking-wider text-muted-gray mb-2">
                  Cakupan Wilayah {area.city}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {area.coverageAreas.map((subArea) => (
                    <span
                      key={subArea}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-label-sm text-on-surface"
                    >
                      <MapPin aria-hidden className="size-3 text-primary" />
                      {subArea}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
                <WhatsAppCta
                  source="services"
                  context={`Halo SAVOY, saya ingin konsultasi furniture custom untuk wilayah ${area.city}.`}
                >
                  Konsultasi Area {area.city}
                </WhatsAppCta>
                <Link
                  href="/survey"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-hairline bg-surface-container-lowest px-5 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container"
                >
                  <CalendarCheck aria-hidden className="mr-2 size-4" />
                  Jadwalkan Survey
                </Link>
              </div>
            </div>

            {/* Value checklist card */}
            <div className="rounded-lg border border-border-hairline bg-surface-container-lowest p-space-xl shadow-hairline lg:col-span-5">
              <h3 className="text-label-lg font-semibold text-on-surface">
                Standar Pengerjaan SAVOY di {area.city}
              </h3>
              <ul className="mt-space-md space-y-space-sm text-body-sm text-on-surface-variant">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-on-surface">Survey aktual di lokasi:</strong>{" "}
                    Pengukuran detail dinding, elevasi lantai, dan titik instalasi air/listrik.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-on-surface">Material tahan lembab:</strong> Standar
                    High Moisture Resistance (HMR) untuk kitchen set dan area basah.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-on-surface">Workshop sendiri:</strong> Tanpa pihak ketiga,
                    memastikan kualitas potongan presisi dan finishing rapi.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <strong className="text-on-surface">Pemasangan tim in-house:</strong> Instalasi
                    bersih dan penyesuaian detail di tempat oleh tim terlatih.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Articles & Guides for this Area */}
      <section id="artikel" className="bg-surface-container-low py-space-4xl">
        <div className="container-editorial">
          <div className="mb-space-2xl space-y-space-2xs">
            <Eyebrow>Artikel & Panduan • {area.name}</Eyebrow>
            <h2 className="text-headline-md text-on-surface">
              Wawasan & Panduan Pengerjaan di {area.city}
            </h2>
            <p className="text-body-md text-on-surface-variant max-w-2xl">
              Artikel edukasi, ulasan material, serta tips perencanaan interior yang ditulis
              khusus untuk membantu Anda sebelum memulai proyek custom furniture di area {area.city}.
            </p>
          </div>

          {areaArticles.length > 0 ? (
            <RevealGroup as="ul" className="grid gap-gutter-desktop md:grid-cols-2">
              {areaArticles.map((article: KnowledgeArticle) => (
                <RevealItem as="li" key={article.slug}>
                  <Link
                    href={`/knowledge/${article.slug}`}
                    className="group flex h-full flex-col justify-between gap-space-lg rounded-md bg-surface-container-lowest p-space-xl shadow-hairline transition-shadow hover:shadow-panel"
                  >
                    <div className="space-y-space-sm">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-label-xs font-semibold text-primary">
                        <FileText aria-hidden className="size-3" />
                        {article.category}
                      </span>
                      <h3 className="text-headline-sm font-semibold leading-snug text-on-surface group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-body-sm leading-relaxed text-on-surface-variant">
                        {article.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-label-md pt-space-xs border-t border-border-hairline">
                      <span className="inline-flex items-center gap-space-2xs text-muted-gray text-label-sm">
                        <Clock aria-hidden className="size-3.5" />
                        {article.readingMinutes} menit baca
                      </span>
                      <span className="inline-flex items-center gap-space-2xs font-semibold text-on-surface transition-colors group-hover:text-primary text-label-sm">
                        Baca panduan
                        <ArrowRight
                          aria-hidden
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="rounded-lg border border-border-hairline bg-surface-container-lowest p-space-2xl text-center shadow-hairline">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-container text-muted-gray mb-space-sm">
                <FileText aria-hidden className="size-6" />
              </div>
              <h3 className="text-headline-sm font-semibold text-on-surface">
                Artikel Kategori {area.name} Sedang Disiapkan
              </h3>
              <p className="mt-2 text-body-sm text-on-surface-variant max-w-lg mx-auto">
                Developer dan tim desainer SAVOY akan segera menerbitkan studi kasus dan panduan spesifik
                untuk wilayah {area.city}. Anda dapat membaca panduan umum kami atau berkonsultasi langsung
                mengenai rencana pembuatan furnitur Anda.
              </p>
              <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-sm">
                <Link
                  href="/knowledge"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-border-hairline bg-surface-container-low px-4 text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container"
                >
                  Buka Semua Panduan Teknis
                </Link>
                <WhatsAppCta
                  source="services"
                  context={`Halo SAVOY, saya ingin berkonsultasi mengenai pembuatan furniture custom di area ${area.city}.`}
                >
                  Konsultasi Sekarang
                </WhatsAppCta>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Switcher to Other Service Areas */}
      <section className="border-t border-border-hairline bg-surface py-space-3xl">
        <div className="container-editorial">
          <div className="space-y-space-md">
            <Eyebrow>Jelajahi Wilayah Lain</Eyebrow>
            <h2 className="text-headline-sm font-semibold text-on-surface">
              Layanan Furniture Custom di Kota & Wilayah Sekitarnya
            </h2>
            <div className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-3 pt-space-xs">
              {otherAreas.map((other) => (
                <Link
                  key={other.slug}
                  href={`/services/${other.slug}`}
                  className="group flex items-center justify-between rounded-md border border-border-hairline bg-surface-container-lowest p-space-md transition-all hover:border-primary hover:bg-surface-container-low"
                >
                  <div>
                    <span className="block text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {other.name}
                    </span>
                    <span className="block text-label-xs text-muted-gray">
                      Area {other.city} & sekitarnya
                    </span>
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="size-4 text-muted-gray transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
