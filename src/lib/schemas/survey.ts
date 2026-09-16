import { z } from "zod";

export const ROOMS = [
  "Kitchen & Pantry",
  "Wardrobe",
  "Bedroom",
  "Living",
  "Full Home",
  "Commercial",
] as const;

export const SCOPES = [
  "Desain dan produksi furniture",
  "Renovasi interior",
  "Built-in storage",
  "Material consultation",
  "Belum yakin",
] as const;

export const TIMELINES = [
  "Secepatnya",
  "1-3 bulan",
  "3-6 bulan",
  "Masih eksplorasi",
] as const;

const phonePattern = /^\+?[0-9\s().-]+$/;

function isPhone(value: string): boolean {
  const digits = value.trim().replace(/\D/g, "");
  return phonePattern.test(value.trim()) && digits.length >= 8 && digits.length <= 15;
}

export const consultationSchema = z.object({
  room: z.enum(ROOMS, { message: "Pilih ruang utama." }),
  scope: z.enum(SCOPES, { message: "Pilih lingkup kebutuhan." }),
  location: z
    .string()
    .trim()
    .min(2, "Tuliskan lokasi proyek.")
    .max(120, "Lokasi terlalu panjang."),
  timeline: z.enum(TIMELINES, { message: "Pilih timeline proyek." }),
  name: z.string().trim().min(2, "Tuliskan nama Anda.").max(80),
  whatsapp: z.string().trim().refine(isPhone, {
    message: "Nomor WhatsApp tidak valid.",
  }),
  notes: z
    .string()
    .trim()
    .max(600, "Catatan maksimal 600 karakter.")
    .optional()
    .or(z.literal("")),
  consent: z.boolean().refine((value) => value, {
    message: "Persetujuan diperlukan untuk mengirim data.",
  }),
});

export type ConsultationInput = z.input<typeof consultationSchema>;
export type ConsultationLead = z.output<typeof consultationSchema>;

export const CONSULTATION_STEPS = [
  { id: "ruang", label: "Ruang", fields: ["room"] },
  { id: "scope", label: "Scope", fields: ["scope"] },
  { id: "lokasi", label: "Lokasi", fields: ["location", "timeline"] },
  { id: "contact", label: "Contact", fields: ["name", "whatsapp", "notes", "consent"] },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  fields: ReadonlyArray<keyof ConsultationInput>;
}>;
