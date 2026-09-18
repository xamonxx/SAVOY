import fs from "fs/promises";
import path from "path";

import { withFileLock } from "@/lib/file-lock";

export type ModerationStatus = "pending" | "approved" | "rejected";

export type PublicReview = {
  id: string;
  author: string;
  address: string;
  email?: string;
  rating: number; // 1 to 5
  description: string;
  createdAt: string;
  moderationStatus: ModerationStatus;
};

const REVIEWS_FILE_PATH = path.join(process.cwd(), "src", "data", "public-reviews.json");

/**
 * Raised when the stored review file cannot be trusted - corrupt JSON, wrong
 * shape, or a filesystem error that isn't "the file doesn't exist yet".
 *
 * Distinct from "no reviews yet" on purpose (audit SAV-002): a caller that
 * catches an unreadable file and treats it the same as an empty array will,
 * on the very next save, write `[newReview]` over whatever was actually on
 * disk - silently deleting every prior review. Only `ENOENT` on first run is
 * allowed to become `[]`; every other failure must stop the mutation instead
 * of quietly proceeding on bad data.
 */
class ReviewsUnreadableError extends Error {}

/**
 * Reads all stored reviews from filesystem (includes developer/admin private
 * data like email). Throws `ReviewsUnreadableError` for anything other than
 * "file does not exist yet" - callers that are about to write must not treat
 * that as "zero reviews".
 */
async function readReviewsOrThrow(): Promise<PublicReview[]> {
  let data: string;
  try {
    data = await fs.readFile(REVIEWS_FILE_PATH, "utf-8");
  } catch (err: unknown) {
    const isEnoent =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT";

    if (!isEnoent) {
      throw new ReviewsUnreadableError("Failed to read reviews file", { cause: err });
    }

    // First-ever run: provision an empty store and return it.
    try {
      await fs.writeFile(REVIEWS_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
    } catch {
      // ignore write error - an empty in-memory array is still correct here
    }
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch (err) {
    throw new ReviewsUnreadableError("Reviews file contains invalid JSON", { cause: err });
  }

  if (!Array.isArray(parsed)) {
    throw new ReviewsUnreadableError("Reviews file does not contain an array");
  }

  return parsed as PublicReview[];
}

/**
 * Reads stored reviews for display purposes only (public page, admin list).
 * Safe to treat a read failure as "nothing to show" here - the difference
 * from `readReviewsOrThrow` is that nothing gets written back afterward.
 */
async function getAllReviewsRaw(): Promise<PublicReview[]> {
  try {
    return await readReviewsOrThrow();
  } catch (error) {
    console.error("[reviews] Failed to read reviews for display:", error);
    return [];
  }
}

/**
 * Reads reviews safe for public consumption: approved only, and the email
 * address is stripped so it is NEVER exposed to the public.
 */
export async function getPublicReviews(): Promise<PublicReview[]> {
  const all = await getAllReviewsRaw();
  return all
    .filter((r) => r && r.moderationStatus === "approved")
    .map((r) => ({
      ...r,
      email: undefined, // Stripped for privacy - developer/admin internal only
    }));
}

/** Reads every review (any status) for the admin moderation list. */
export async function getReviewsForModeration(): Promise<PublicReview[]> {
  return getAllReviewsRaw();
}

/**
 * Writes public reviews atomically to filesystem.
 */
async function writeReviews(reviews: PublicReview[]): Promise<void> {
  const dir = path.dirname(REVIEWS_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tempPath = `${REVIEWS_FILE_PATH}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(reviews, null, 2), "utf-8");
  await fs.rename(tempPath, REVIEWS_FILE_PATH);
}

/**
 * Saves a new public review. Starts as `pending` (audit SAV-001): a review
 * only becomes publicly visible once an admin approves it from
 * /admin/reviews, not the moment it's submitted.
 */
export async function savePublicReview(input: {
  author: string;
  address: string;
  email?: string;
  rating: number;
  description: string;
}): Promise<{ success: boolean; error?: string; review?: PublicReview }> {
  // Serialized per file: two reviews submitted close together must not both
  // read the same "existing" array and each write a version that drops the
  // other's entry. See file-lock.ts.
  return withFileLock(REVIEWS_FILE_PATH, async () => {
    let existing: PublicReview[];
    try {
      existing = await readReviewsOrThrow();
    } catch (error) {
      console.error("[reviews] Refusing to save - existing reviews unreadable:", error);
      return {
        success: false,
        error: "Gagal menyimpan ulasan ke server. Silakan coba lagi.",
      };
    }

    try {
      const newReview: PublicReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author: input.author.trim(),
        address: input.address.trim(),
        email: input.email ? input.email.trim() : undefined,
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        description: input.description.trim(),
        createdAt: new Date().toISOString(),
        moderationStatus: "pending",
      };

      // Prepend so newest reviews appear first
      const updated = [newReview, ...existing];
      await writeReviews(updated);

      return { success: true, review: newReview };
    } catch (error) {
      console.error("[reviews] Failed to save review:", error);
      return {
        success: false,
        error: "Gagal menyimpan ulasan ke server. Silakan coba lagi.",
      };
    }
  });
}

/** Approves or rejects a pending review. Used by the admin moderation page. */
export async function setReviewModerationStatus(
  id: string,
  status: Extract<ModerationStatus, "approved" | "rejected">
): Promise<{ success: boolean; error?: string }> {
  return withFileLock(REVIEWS_FILE_PATH, async () => {
    let existing: PublicReview[];
    try {
      existing = await readReviewsOrThrow();
    } catch (error) {
      console.error("[reviews] Refusing to moderate - existing reviews unreadable:", error);
      return { success: false, error: "Gagal membaca data ulasan. Silakan coba lagi." };
    }

    const index = existing.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, error: "Ulasan tidak ditemukan." };
    }

    try {
      existing[index] = { ...existing[index], moderationStatus: status };
      await writeReviews(existing);
      return { success: true };
    } catch (error) {
      console.error("[reviews] Failed to update moderation status:", error);
      return { success: false, error: "Gagal memperbarui status ulasan." };
    }
  });
}
