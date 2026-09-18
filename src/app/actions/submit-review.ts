"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { extractClientIp } from "@/lib/auth";
import { savePublicReview } from "@/lib/reviews";
import { sendReviewEmailNotification } from "@/lib/email";
import { checkSubmissionLimit, recordSubmission } from "@/lib/submission-limiter";

const reviewSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama wajib diisi (minimal 2 karakter).")
    .max(80, "Nama maksimal 80 karakter."),
  address: z
    .string()
    .trim()
    .min(2, "Alamat / kota wajib diisi (minimal 2 karakter).")
    .max(100, "Alamat / kota maksimal 100 karakter."),
  email: z
    .string()
    .trim()
    .email("Format alamat email tidak valid (contoh: nama@domain.com)."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating minimal 1 bintang.")
    .max(5, "Rating maksimal 5 bintang."),
  description: z
    .string()
    .trim()
    .min(5, "Deskripsi ulasan, kritik, atau saran minimal 5 karakter.")
    .max(1000, "Deskripsi maksimal 1000 karakter."),
});

export type SubmitReviewResult =
  | { success: true; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const SUCCESS_MESSAGE =
  "Terima kasih atas ulasan dan masukan Anda! Ulasan Anda akan tampil di halaman publik setelah ditinjau oleh tim kami.";

export async function submitReviewAction(
  formData: FormData
): Promise<SubmitReviewResult> {
  // Honeypot: a real visitor never sees or fills this field (hidden via CSS,
  // not `type="hidden"`, since some bots skip genuinely hidden inputs). A
  // filled value means a bot filled every field it could find. Answered with
  // the same success shape a real submission gets - a bot that learns "this
  // field gets me rejected" just stops filling it, which defeats the point.
  if (String(formData.get("website") ?? "").trim()) {
    return { success: true, message: SUCCESS_MESSAGE };
  }

  const headersList = await headers();
  const clientIp = extractClientIp(headersList);
  const limitStatus = checkSubmissionLimit("review", clientIp);
  if (!limitStatus.allowed) {
    const minutes = Math.ceil(limitStatus.retryAfterSeconds / 60);
    return {
      success: false,
      error: `Terlalu banyak ulasan dikirim dari jaringan Anda. Silakan coba lagi dalam ${minutes} menit.`,
    };
  }

  const raw = {
    name: formData.get("name"),
    address: formData.get("address"),
    email: formData.get("email"),
    rating: formData.get("rating"),
    description: formData.get("description"),
  };

  const parsed = reviewSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      success: false,
      error: "Mohon lengkapi formulir ulasan dengan benar.",
      fieldErrors,
    };
  }

  const result = await savePublicReview({
    author: parsed.data.name,
    address: parsed.data.address,
    email: parsed.data.email,
    rating: parsed.data.rating,
    description: parsed.data.description,
  });

  if (!result.success || !result.review) {
    return {
      success: false,
      error: result.error || "Gagal mengirimkan ulasan. Silakan coba lagi.",
    };
  }

  // Counted only once the review has actually been written to disk - a
  // rejected/failed attempt above never consumed a slot from the quota.
  recordSubmission("review", clientIp);

  // Dispatch email notification to info@savoyinterior.com
  try {
    await sendReviewEmailNotification(result.review);
  } catch (err) {
    console.error("[reviews] Background email dispatch error:", err);
    // Don't fail user review submission if email delivery is pending or delayed
  }

  revalidatePath("/");
  return {
    success: true,
    message:
      "Terima kasih atas ulasan dan masukan Anda! Ulasan Anda akan tampil di halaman publik setelah ditinjau oleh tim kami.",
  };
}
