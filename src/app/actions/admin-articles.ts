"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteArticle, saveArticle, toggleArticleStatus } from "@/lib/articles";
import { articleSchema, formatArticleIssues } from "@/lib/schemas/article";
import type { KnowledgeArticle } from "@/types";

export type ArticleActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  slug?: string;
  newStatus?: "aktif" | "tidak_aktif";
};

export async function saveArticleAction(
  article: KnowledgeArticle,
  /**
   * The slug the article was loaded under, only sent when editing an
   * existing article. `saveArticle` looks records up by `slug` alone (audit
   * SAV-008), so without this a changed slug silently becomes a brand-new
   * record and the old URL never goes away. The admin UI locks the slug
   * input while editing; this is the server-side half of the same guard in
   * case that ever gets bypassed.
   */
  originalSlug?: string
): Promise<ArticleActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  // Format slug to be URL safe before validating - the schema's slug rule is
  // about length, not character normalization.
  const formattedSlug = (article.slug || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (originalSlug && originalSlug !== formattedSlug) {
    return {
      error:
        "Slug tidak dapat diubah saat mengedit artikel. Buat artikel baru jika Anda benar-benar perlu URL yang berbeda.",
    };
  }

  const candidate = {
    ...article,
    slug: formattedSlug,
    publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
    readingMinutes: Number(article.readingMinutes) || 5,
    status: article.status || "aktif",
  };

  const parsed = articleSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      error: "Mohon periksa kembali isian artikel.",
      fieldErrors: formatArticleIssues(parsed.error),
    };
  }

  const result = await saveArticle(parsed.data as KnowledgeArticle);
  if (!result.success) {
    return { error: result.error || "Gagal menyimpan artikel." };
  }

  // Real-time on-demand revalidation. /sitemap.xml is its own cached
  // metadata route (audit SAV-006) - without revalidating it explicitly, a
  // newly published or unpublished article never shows up there until the
  // next full rebuild.
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${parsed.data.slug}`);
  revalidatePath("/");
  revalidatePath("/admin/articles");
  revalidatePath("/sitemap.xml");

  return { success: true, slug: parsed.data.slug, newStatus: parsed.data.status };
}

export async function toggleArticleStatusAction(
  slug: string
): Promise<ArticleActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  const result = await toggleArticleStatus(slug);
  if (!result.success) {
    return { error: result.error || "Gagal mengubah status artikel." };
  }

  // Real-time on-demand revalidation
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/articles");
  revalidatePath("/sitemap.xml");

  return { success: true, slug, newStatus: result.newStatus };
}

export async function deleteArticleAction(
  slug: string
): Promise<ArticleActionResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  const result = await deleteArticle(slug);
  if (!result.success) {
    return { error: result.error || "Gagal menghapus artikel." };
  }

  // Real-time on-demand revalidation
  revalidatePath("/knowledge");
  revalidatePath(`/knowledge/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/articles");
  revalidatePath("/sitemap.xml");

  return { success: true };
}

export type UploadImageResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadArticleImageAction(
  formData: FormData
): Promise<UploadImageResult> {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return { success: false, error: "Sesi admin telah berakhir. Silakan login kembali." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "File gambar tidak ditemukan." };
  }

  const fileType = file.type.toLowerCase();
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(fileType)) {
    return {
      success: false,
      error: "Hanya format file JPG dan PNG yang didukung.",
    };
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Ukuran gambar melebihi batas maksimal 10 MB." };
  }

  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const { default: sharp } = await import("sharp");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "articles");
    await fs.mkdir(uploadsDir, { recursive: true });

    const cleanBase = file.name
      .toLowerCase()
      .replace(/\.(jpg|jpeg|png)$/, "")
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 30);

    const fileName = `${Date.now()}-${cleanBase || "gambar"}.webp`;
    const filePath = path.join(uploadsDir, fileName);

    /*
      Uploads used to be written through untouched, at up to the 10 MB the
      check above allows, and then rendered at full size on the public article
      page. A phone on mobile data was downloading a camera original to look at
      a picture in a blog post.

      Everything else on this site is resized before it ships; there is no
      reason an uploaded illustration should be the exception. 1600px matches
      MAX_EDGE in the image pipeline, and the encode costs a second or two on
      an action only a logged-in editor ever triggers - it is not on any
      visitor's path.

      `rotate()` with no argument applies the EXIF orientation and then drops
      the tag, which is what keeps phone photos from arriving sideways.
    */
    await sharp(buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(filePath);

    return {
      success: true,
      url: `/uploads/articles/${fileName}`,
    };
  } catch (err) {
    console.error("Failed to upload image file:", err);
    return {
      success: false,
      error: "Gagal menyimpan file gambar di server.",
    };
  }
}
