"use server";

import { consultationSchema } from "@/lib/schemas/survey";
import { postToWebhook } from "@/lib/webhook";

export type ConsultationActionResult =
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function submitSurvey(
  formData: FormData
): Promise<ConsultationActionResult> {
  const raw = {
    room: formData.get("room"),
    scope: formData.get("scope"),
    location: formData.get("location"),
    timeline: formData.get("timeline"),
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    notes: formData.get("notes") ?? "",
    consent: formData.get("consent") === "true",
  };

  const parsed = consultationSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Beberapa isian belum sesuai. Mohon periksa kembali.",
      fieldErrors,
    };
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (webhook) {
    const result = await postToWebhook(webhook, {
      ...parsed.data,
      submittedAt: new Date().toISOString(),
    });

    if (!result.ok) {
      console.error("[consultation] Webhook delivery failed:", result.error);
      return {
        status: "error",
        message:
          "Data gagal terkirim. Silakan coba lagi atau hubungi SAVOY langsung.",
      };
    }
  }

  return { status: "success" };
}
