"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { extractClientIp } from "@/lib/auth";
import {
  formatSurveyDate,
  formatSurveyTime,
  resolveProjectNeed,
  surveySchema,
} from "@/lib/schemas/survey";
import { checkSubmissionLimit, recordSubmission } from "@/lib/submission-limiter";
import { postToWebhook } from "@/lib/webhook";

export type SurveyActionResult =
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * Receives a survey lead.
 *
 * Re-validates everything server-side (never trusting the browser), then
 * forwards the lead to `LEAD_WEBHOOK_URL` when one is configured. Without a
 * webhook the submission still succeeds: the form hands the visitor straight
 * to WhatsApp, which is the channel the studio actually works from.
 *
 * Text only - the form takes no uploads. Room photos are asked for in the
 * WhatsApp conversation instead, so nothing is ever written to disk here.
 */
export async function submitSurvey(
  formData: FormData
): Promise<SurveyActionResult> {
  // Honeypot: see the identical comment in submit-review.ts. A filled value
  // gets the same success response a real lead gets, so a bot never learns
  // which field gave it away.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success" };
  }

  const headersList = await headers();
  const clientIp = extractClientIp(headersList);
  const limitStatus = checkSubmissionLimit("survey", clientIp);
  if (!limitStatus.allowed) {
    const minutes = Math.ceil(limitStatus.retryAfterSeconds / 60);
    return {
      status: "error",
      message: `Terlalu banyak pengajuan dari jaringan Anda. Silakan coba lagi dalam ${minutes} menit, atau hubungi kami langsung via WhatsApp.`,
    };
  }

  const raw = {
    projectType: formData.get("projectType"),
    projectTypeOther: formData.get("projectTypeOther") ?? "",
    province: formData.get("province"),
    city: formData.get("city"),
    district: formData.get("district") ?? "",
    address: formData.get("address"),
    propertyType: formData.get("propertyType"),
    targetTimeline: formData.get("targetTimeline"),
    budgetRange: formData.get("budgetRange") || undefined,
    notes: formData.get("notes") ?? "",
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    emergencyPhone: formData.get("emergencyPhone") ?? "",
    surveyDate: formData.get("surveyDate"),
    surveyTime: formData.get("surveyTime"),
    consent: formData.get("consent") === "true",
  };

  const parsed = surveySchema.safeParse(raw);

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
    // Generated once, before the retry loop, so every retry of this same
    // submission carries the same idempotency key (audit SAV-018) - a lead
    // that times out on our end but actually reached the receiver won't get
    // double-booked when the retry lands too.
    const eventId = randomUUID();
    const result = await postToWebhook(
      webhook,
      {
        ...parsed.data,
        // Pre-resolved so a webhook consumer never has to re-implement the
        // "Lainnya" fallback or the Indonesian date formatting.
        need: resolveProjectNeed(parsed.data),
        scheduleLabel: `${formatSurveyDate(parsed.data.surveyDate)}, ${formatSurveyTime(parsed.data.surveyTime)}`,
        submittedAt: new Date().toISOString(),
      },
      eventId
    );

    if (!result.ok) {
      console.error("[survey] Webhook delivery failed:", result.error);
      return {
        status: "error",
        message:
          "Data gagal terkirim ke sistem kami. Silakan coba lagi atau hubungi kami langsung via WhatsApp.",
      };
    }
  }

  recordSubmission("survey", clientIp);
  return { status: "success" };
}
