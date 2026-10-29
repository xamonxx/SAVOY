import { ArrowUpRight, Building2, Clock, MapPin } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { Faq } from "@/components/sections/faq";
import { MapSection } from "@/components/sections/map-section";
import { BRANCHES } from "@/data/branches";
import { Survey } from "@/components/sections/survey";
import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import {
  ORGANISATION_ID,
  breadcrumbJsonLd,
  buildMetadata,
  jsonLdGraph,
  jsonLdScript,
  webPageJsonLd,
} from "@/lib/seo";
import { hasWhatsApp, site } from "@/lib/site";

const ALAMAT_DESCRIPTION =
  "Informasi lengkap alamat Kantor Pusat Savoy Interior di Bandung Barat dan Kantor Cabang Depok. Kunjungi kantor kami untuk konsultasi langsung dan survey interior custom.";

export const metadata = buildMetadata({
  title: "Alamat Kantor SAVOY INTERIOR",
  description: ALAMAT_DESCRIPTION,
  path: "/alamat",
});

function alamatJsonLd() {
  return jsonLdGraph(
    {
      ...webPageJsonLd({
        path: "/alamat",
        name: `Alamat Kantor ${site.name}`,
        description: ALAMAT_DESCRIPTION,
        breadcrumb: true,
      }),
      mainEntity: { "@id": ORGANISATION_ID },
    },
    breadcrumbJsonLd([{ name: "Alamat", path: "/alamat" }])
  );
}

export default function AlamatPage() {
  const whatsappReady = hasWhatsApp();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(alamatJsonLd())}
      />

      <PageHeader
        eyebrow="Alamat & Lokasi"
        title="Alamat Kantor SAVOY INTERIOR"
        lead="Kunjungi kantor pusat atau kantor cabang kami untuk berkonsultasi mengenai kebutuhan interior dan custom furniture hunian Anda. Tim kami siap membantu dari tahap perencanaan, desain, hingga instalasi."
      />

      {/* Branch Cards Overview */}
      <section className="bg-surface py-space-3xl lg:py-space-4xl">
        <div className="container-editorial">
          <div className="grid gap-space-xl md:grid-cols-2">
            {BRANCHES.map((branch, index) => (
              <Reveal
                key={branch.id}
                delay={index === 0 ? 0 : 1}
                className="flex flex-col justify-between gap-space-lg rounded-md border border-border-hairline bg-surface-container-lowest p-space-xl shadow-hairline"
              >
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between gap-space-sm">
                    <span className="inline-block rounded-full bg-primary-container/10 px-2.5 py-1 text-label-sm font-semibold text-primary">
                      {branch.badge}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-md bg-surface-container text-primary">
                      <Building2 aria-hidden className="size-5" />
                    </span>
                  </div>

                  <div>
                    <h2 className="text-headline-sm font-bold text-on-surface">
                      {branch.name}
                    </h2>
                    <p className="mt-space-2xs text-body-sm text-on-surface-variant leading-relaxed">
                      {branch.description}
                    </p>
                  </div>

                  <div className="space-y-space-sm border-t border-border-hairline pt-space-md">
                    <div className="flex items-start gap-space-sm">
                      <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
                      <p className="text-body-sm text-on-surface-variant leading-relaxed">
                        {branch.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-space-sm">
                      <Clock aria-hidden className="size-4 shrink-0 text-primary" />
                      <p className="text-body-sm text-on-surface-variant">
                        {branch.hours}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm border-t border-border-hairline pt-space-md">
                  <Button
                    href={branch.mapsUrl}
                    external
                    variant="primary"
                    size="sm"
                  >
                    Buka di Google Maps
                    <ArrowUpRight aria-hidden className="size-4" />
                  </Button>
                  {whatsappReady ? (
                    <WhatsAppCta
                      source="contact"
                      size="sm"
                      variant="outline"
                      context={`Konsultasi ${branch.name}`}
                    >
                      Chat WhatsApp
                    </WhatsAppCta>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section with Tab Switcher */}
      <MapSection className="border-t border-border-hairline bg-surface-container-low" />

      {/* Survey & FAQ */}
      <Survey />
      <Faq />
    </>
  );
}
