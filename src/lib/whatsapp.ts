import { hasWhatsApp, site } from "@/lib/site";

export type WhatsAppSource =
  | "hero"
  | "header"
  | "projects"
  | "services"
  | "process"
  | "faq"
  | "planner_success"
  | "final_cta"
  | "footer"
  | "sticky_mobile";

const SOURCE_CONTEXT: Record<WhatsAppSource, string> = {
  hero: "Hero",
  header: "Header",
  projects: "Featured projects",
  services: "Services",
  process: "Process",
  faq: "FAQ",
  planner_success: "Consultation planner",
  final_cta: "Final CTA",
  footer: "Footer",
  sticky_mobile: "Sticky mobile CTA",
};

const DEFAULT_MESSAGE = [
  `Halo ${site.name},`,
  "",
  "Saya ingin konsultasi proyek interior/custom furniture.",
  "",
  "Nama:",
  "Lokasi:",
  "Ruang yang ingin dikerjakan:",
].join("\n");

export type WhatsAppLinkOptions = {
  source: WhatsAppSource;
  message?: string;
  context?: string;
};

export function buildWhatsAppUrl({
  source,
  message,
  context,
}: WhatsAppLinkOptions): string | null {
  if (!hasWhatsApp()) return null;

  const lines = [message ?? DEFAULT_MESSAGE];
  if (context) lines.push("", context);
  lines.push("", `(via web - ${SOURCE_CONTEXT[source]})`);

  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

function line(label: string, value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? `${label}${trimmed}` : null;
}

export type ConsultationInput = {
  room: string;
  scope: string;
  location: string;
  timeline: string;
  name: string;
  whatsapp: string;
  notes?: string;
};

export function buildConsultationMessage(input: ConsultationInput): string {
  return [
    `KONSULTASI PROYEK - ${site.name}`,
    "----------------------------------------",
    line("Nama: ", input.name),
    line("WhatsApp: ", input.whatsapp),
    line("Ruang: ", input.room),
    line("Scope: ", input.scope),
    line("Lokasi: ", input.location),
    line("Timeline: ", input.timeline),
    line("Catatan: ", input.notes),
  ]
    .filter((entry): entry is string => entry !== null)
    .join("\n");
}
