"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { setReviewModerationStatus } from "@/lib/reviews";

export type ReviewActionResult = {
  success?: boolean;
  error?: string;
};

export async function approveReviewAction(id: string): Promise<ReviewActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  const result = await setReviewModerationStatus(id, "approved");
  if (!result.success) {
    return { error: result.error || "Gagal menyetujui ulasan." };
  }

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function rejectReviewAction(id: string): Promise<ReviewActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  const result = await setReviewModerationStatus(id, "rejected");
  if (!result.success) {
    return { error: result.error || "Gagal menolak ulasan." };
  }

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  return { success: true };
}
