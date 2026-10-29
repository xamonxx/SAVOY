"use client";

import { useState } from "react";
import { ArrowUpRight, Building2, Clock, MapPin, MessageCircle } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/typography";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { BRANCHES, type LocationBranch } from "@/data/branches";
import { cn } from "@/lib/cn";
import { hasWhatsApp } from "@/lib/site";

export type { LocationBranch };
export { BRANCHES };

export function MapSection({
  id = "lokasi",
  className,
}: {
  id?: string;
  className?: string;
}) {
  const [activeBranchId, setActiveBranchId] = useState<"bandung" | "depok">("bandung");
  const activeBranch =
    BRANCHES.find((b) => b.id === activeBranchId) ?? BRANCHES[0];
  const whatsappReady = hasWhatsApp();

  return (
    <section
      id={id}
      className={cn("bg-surface-container-low py-space-4xl", className)}
    >
      <div className="container-editorial">
        <Reveal>
          <div className="mb-space-2xl max-w-2xl">
            <SectionHeading
              eyebrow="Lokasi Kantor"
              title="Kunjungi Kantor SAVOY INTERIOR"
              lead="Kami menyambut Anda untuk berkonsultasi langsung, melihat sampel material, atau mengatur jadwal survey lokasi bersama tim kami."
            />
          </div>
        </Reveal>

        {/* Branch Switcher Tabs - Apple Segmented Control */}
        <Reveal delay={1}>
          <div
            role="tablist"
            aria-label="Pilihan lokasi kantor Savoy Interior"
            className="mb-space-xl inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-black/[0.05] bg-black/[0.04] p-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md"
          >
            {BRANCHES.map((branch) => {
              const isActive = branch.id === activeBranchId;
              return (
                <button
                  key={branch.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${branch.id}`}
                  id={`tab-${branch.id}`}
                  onClick={() => setActiveBranchId(branch.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13.5px] font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98]",
                    isActive
                      ? "border border-black/[0.04] bg-white text-on-surface shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-on-surface-variant hover:bg-black/[0.03] hover:text-on-surface"
                  )}
                >
                  <Building2
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-gray"
                    )}
                  />
                  <span>{branch.shortLabel}</span>
                  <span
                    className={cn(
                      "hidden rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:inline-block tracking-normal",
                      isActive
                        ? "bg-primary-container/20 text-primary"
                        : "bg-black/[0.04] text-muted-gray"
                    )}
                  >
                    {branch.city}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="grid items-stretch gap-space-xl lg:grid-cols-12 lg:gap-gutter-desktop">
          {/* Information Card - Apple Squircle Elevation */}
          <div
            id={`panel-${activeBranch.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeBranch.id}`}
            className="flex flex-col justify-between gap-space-lg rounded-3xl border border-black/[0.06] bg-white p-7 sm:p-8 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.02)] lg:col-span-5"
          >
            <div className="space-y-space-lg">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wider text-primary">
                  {activeBranch.badge}
                </span>
                <h3 className="mt-space-2xs text-2xl font-bold tracking-tight text-on-surface">
                  {activeBranch.name}
                </h3>
                <p className="mt-space-2xs text-[14px] text-on-surface-variant leading-relaxed">
                  {activeBranch.description}
                </p>
              </div>

              <div className="space-y-space-md border-t border-black/[0.06] pt-space-md">
                <div className="flex items-start gap-space-md">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container/15 text-primary">
                    <MapPin aria-hidden className="size-5" />
                  </span>
                  <div className="space-y-space-2xs">
                    <h4 className="text-[13.5px] font-semibold tracking-tight text-on-surface">
                      Alamat Kantor
                    </h4>
                    <p className="text-[13px] leading-relaxed text-on-surface-variant">
                      {activeBranch.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-space-md">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container/15 text-primary">
                    <Clock aria-hidden className="size-5" />
                  </span>
                  <div className="space-y-space-2xs">
                    <h4 className="text-[13.5px] font-semibold tracking-tight text-on-surface">
                      Jam Operasional
                    </h4>
                    <p className="text-[13px] leading-relaxed text-on-surface-variant">
                      {activeBranch.hours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-space-md">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-container/15 text-primary">
                    <MessageCircle aria-hidden className="size-5" />
                  </span>
                  <div className="space-y-space-2xs">
                    <h4 className="text-[13.5px] font-semibold tracking-tight text-on-surface">
                      Konsultasi & Kunjungan
                    </h4>
                    <p className="text-[13px] leading-relaxed text-on-surface-variant">
                      Sebelum datang berkunjung atau untuk menjadwalkan survey ukuran, silakan hubungi tim kami via WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm border-t border-black/[0.06] pt-space-lg">
              <Button
                href={activeBranch.mapsUrl}
                external
                variant="primary"
                size="sm"
                className="rounded-xl px-5 py-2.5 font-semibold shadow-sm active:scale-[0.97] transition-all"
              >
                Buka di Google Maps
                <ArrowUpRight aria-hidden className="size-4" />
              </Button>
              {whatsappReady ? (
                <WhatsAppCta
                  source="contact"
                  size="sm"
                  variant="outline"
                  context={`Konsultasi ${activeBranch.name}`}
                  className="rounded-xl border-black/[0.08] px-5 py-2.5 font-semibold hover:bg-black/[0.03] active:scale-[0.97] transition-all"
                >
                  Hubungi via WhatsApp
                </WhatsAppCta>
              ) : null}
            </div>
          </div>

          {/* Google Maps Embed Frame - Apple Smooth Bezel */}
          <div className="min-h-[400px] overflow-hidden rounded-3xl border border-black/[0.08] bg-surface-container shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.02)] lg:col-span-7 lg:min-h-[480px]">
            <iframe
              key={activeBranch.id}
              src={activeBranch.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title={`Peta Lokasi ${activeBranch.name}`}
              className="h-full min-h-[400px] w-full border-0 lg:min-h-[480px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
