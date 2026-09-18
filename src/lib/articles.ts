import fs from "fs/promises";
import path from "path";

import { withFileLock } from "@/lib/file-lock";
import { knowledgeArticles as baselineArticles } from "@/data/knowledge";
import type { KnowledgeArticle } from "@/types";
export { parseRawTextToBlocks, estimateReadingMinutes } from "./article-utils";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "custom-articles.json");

/**
 * Raised when the stored article file cannot be trusted - corrupt JSON,
 * wrong shape, or a filesystem error that isn't "the file doesn't exist
 * yet" (audit SAV-002). Distinct from "no custom articles yet" on purpose: a
 * caller about to write must not treat an unreadable file the same as an
 * empty array, or the next save overwrites every existing article with just
 * the one being saved.
 */
class ArticlesUnreadableError extends Error {}

/**
 * Reads dynamic custom articles, throwing `ArticlesUnreadableError` for
 * anything other than "file does not exist yet". Callers that are about to
 * write must use this, not `readCustomArticlesForDisplay` below.
 */
async function readCustomArticlesOrThrow(): Promise<KnowledgeArticle[]> {
  let data: string;
  try {
    data = await fs.readFile(DATA_FILE_PATH, "utf-8");
  } catch (err: unknown) {
    const isEnoent =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ENOENT";

    if (!isEnoent) {
      throw new ArticlesUnreadableError("Failed to read custom articles file", { cause: err });
    }

    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2), "utf-8");
    } catch {
      // ignore write error - an empty in-memory array is still correct here
    }
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch (err) {
    throw new ArticlesUnreadableError("Custom articles file contains invalid JSON", { cause: err });
  }

  if (!Array.isArray(parsed)) {
    throw new ArticlesUnreadableError("Custom articles file does not contain an array");
  }

  return parsed as KnowledgeArticle[];
}

/**
 * Reads custom articles for display purposes only. Safe to treat a read
 * failure as "nothing custom to show" here - unlike the mutators below,
 * nothing gets written back afterward, so the worst case is briefly falling
 * back to the baseline set rather than losing data.
 */
async function readCustomArticlesForDisplay(): Promise<KnowledgeArticle[]> {
  try {
    return await readCustomArticlesOrThrow();
  } catch (error) {
    console.error("[articles] Failed to read custom articles for display:", error);
    return [];
  }
}

/**
 * Writes dynamic custom articles to the filesystem atomically using a temp file.
 */
async function writeCustomArticles(articles: KnowledgeArticle[]): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tempPath = `${DATA_FILE_PATH}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(articles, null, 2), "utf-8");
  await fs.rename(tempPath, DATA_FILE_PATH);
}

/**
 * Returns articles.
 * - If includeInactive is false (default for public), only returns status === 'aktif'.
 * - If includeInactive is true (for admin), returns all articles including drafts/tidak_aktif.
 */
export async function getAllArticles(options?: {
  includeInactive?: boolean;
}): Promise<KnowledgeArticle[]> {
  const custom = await readCustomArticlesForDisplay();

  // Create a map to allow custom articles to override baseline articles if same slug
  const map = new Map<string, KnowledgeArticle>();

  // Add baseline first (default status: 'aktif')
  for (const article of baselineArticles) {
    map.set(article.slug, {
      ...article,
      status: article.status || "aktif",
    });
  }

  // Overlay custom articles (or add new ones)
  for (const article of custom) {
    map.set(article.slug, {
      ...article,
      status: article.status || "aktif",
    });
  }

  let all = Array.from(map.values());

  // Filter out inactive articles for public views
  if (!options?.includeInactive) {
    all = all.filter((a) => a.status !== "tidak_aktif");
  }

  // Sort newest first
  return all.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Finds an article by its slug.
 * - For public views (allowInactive = false), returns undefined if article is 'tidak_aktif'.
 * - For admin views (allowInactive = true), returns the article regardless of status.
 */
export async function getArticleBySlug(
  slug: string,
  options?: { allowInactive?: boolean }
): Promise<KnowledgeArticle | undefined> {
  const custom = await readCustomArticlesForDisplay();
  const foundCustom = custom.find((a) => a.slug === slug);

  const article =
    foundCustom || baselineArticles.find((a) => a.slug === slug);

  if (!article) return undefined;

  const normalized: KnowledgeArticle = {
    ...article,
    status: article.status || "aktif",
  };

  if (!options?.allowInactive && normalized.status === "tidak_aktif") {
    return undefined;
  }

  return normalized;
}

/**
 * Checks if an article is stored in custom storage.
 */
export async function isCustomArticle(slug: string): Promise<boolean> {
  const custom = await readCustomArticlesForDisplay();
  return custom.some((a) => a.slug === slug);
}

/**
 * Saves (creates or updates) an article with publication status.
 */
export async function saveArticle(
  article: KnowledgeArticle
): Promise<{ success: boolean; error?: string }> {
  // Serialized per file: see file-lock.ts. Without this, two admin tabs (or
  // an autosave racing a manual save) can each read the same array and one
  // save silently disappears when the other writes on top of it.
  return withFileLock(DATA_FILE_PATH, async () => {
    if (!article.slug || !article.title || !article.summary) {
      return { success: false, error: "Slug, Judul, dan Ringkasan wajib diisi." };
    }

    let custom: KnowledgeArticle[];
    try {
      custom = await readCustomArticlesOrThrow();
    } catch (error) {
      console.error("[articles] Refusing to save - existing articles unreadable:", error);
      return {
        success: false,
        error: "Gagal membaca data artikel yang ada. Artikel tidak disimpan untuk mencegah kehilangan data.",
      };
    }

    try {
      const existingIndex = custom.findIndex((a) => a.slug === article.slug);

      const articleToSave: KnowledgeArticle = {
        ...article,
        status: article.status || "aktif",
      };

      if (existingIndex >= 0) {
        // Update existing
        custom[existingIndex] = {
          ...articleToSave,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      } else {
        // Insert new
        custom.push({
          ...articleToSave,
          publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
        });
      }

      await writeCustomArticles(custom);
      return { success: true };
    } catch (err: unknown) {
      console.error("[articles] Failed to save article:", err);
      return { success: false, error: "Gagal menyimpan artikel." };
    }
  });
}

/**
 * Toggles an article status between 'aktif' and 'tidak_aktif'.
 */
export async function toggleArticleStatus(
  slug: string
): Promise<{ success: boolean; newStatus?: "aktif" | "tidak_aktif"; error?: string }> {
  return withFileLock(DATA_FILE_PATH, async () => {
    let custom: KnowledgeArticle[];
    try {
      custom = await readCustomArticlesOrThrow();
    } catch (error) {
      console.error("[articles] Refusing to toggle status - existing articles unreadable:", error);
      return { success: false, error: "Gagal membaca data artikel. Status tidak diubah." };
    }

    try {
      const existingIndex = custom.findIndex((a) => a.slug === slug);

      let targetArticle: KnowledgeArticle | undefined;

      if (existingIndex >= 0) {
        targetArticle = custom[existingIndex];
        const newStatus = targetArticle.status === "tidak_aktif" ? "aktif" : "tidak_aktif";
        custom[existingIndex] = {
          ...targetArticle,
          status: newStatus,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        await writeCustomArticles(custom);
        return { success: true, newStatus };
      }

      // If it's a baseline article, copy to custom with toggled status
      const baseline = baselineArticles.find((a) => a.slug === slug);
      if (baseline) {
        const currentStatus = baseline.status || "aktif";
        const newStatus = currentStatus === "tidak_aktif" ? "aktif" : "tidak_aktif";
        const newCustomArticle: KnowledgeArticle = {
          ...baseline,
          status: newStatus,
          updatedAt: new Date().toISOString().split("T")[0],
        };
        custom.push(newCustomArticle);
        await writeCustomArticles(custom);
        return { success: true, newStatus };
      }

      return { success: false, error: "Artikel tidak ditemukan." };
    } catch (err: unknown) {
      console.error("[articles] Failed to toggle article status:", err);
      return { success: false, error: "Gagal mengubah status artikel." };
    }
  });
}

/**
 * Deletes a custom article by slug.
 */
export async function deleteArticle(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  return withFileLock(DATA_FILE_PATH, async () => {
    let custom: KnowledgeArticle[];
    try {
      custom = await readCustomArticlesOrThrow();
    } catch (error) {
      console.error("[articles] Refusing to delete - existing articles unreadable:", error);
      return { success: false, error: "Gagal membaca data artikel. Artikel tidak dihapus." };
    }

    const isCustom = custom.some((a) => a.slug === slug);

    if (!isCustom) {
      return {
        success: false,
        error: "Artikel bawaan sistem (baseline) tidak dapat dihapus permanen. Anda dapat mengubah statusnya menjadi 'Tidak Aktif' agar tidak muncul di publik.",
      };
    }

    // Audit SAV-009: a custom record can also be an *override* of a
    // baseline slug (e.g. after toggling a baseline article's status, or
    // editing its content). Deleting that override doesn't remove the
    // article - `getArticleBySlug`/`getAllArticles` fall straight back to
    // the still-present baseline entry, silently republishing content an
    // operator just deleted. Only a slug with no baseline counterpart can
    // ever be permanently removed.
    const hasBaseline = baselineArticles.some((a) => a.slug === slug);
    if (hasBaseline) {
      return {
        success: false,
        error:
          "Artikel ini adalah override dari artikel bawaan sistem. Menghapusnya akan membuat versi bawaan tampil kembali. Gunakan tombol 'Tidak Aktif' untuk menyembunyikannya dari publik.",
      };
    }

    try {
      const filtered = custom.filter((a) => a.slug !== slug);
      await writeCustomArticles(filtered);
      return { success: true };
    } catch (err: unknown) {
      console.error("[articles] Failed to delete article:", err);
      return { success: false, error: "Gagal menghapus artikel." };
    }
  });
}
