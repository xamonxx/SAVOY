import { z } from "zod";

import { isSafeHref } from "@/lib/article-utils";
import { isValidCalendarDate } from "@/lib/date-utils";

/**
 * Runtime contract for a saved `KnowledgeArticle` (audit SAV-007).
 *
 * `KnowledgeArticle`/`KnowledgeBlock` in `src/types/index.ts` are
 * compile-time types only - they describe the shape TypeScript expects, not
 * what actually arrives at the Server Action boundary. Without this,
 * `publishedAt: "garbage"` or a malformed block persists straight to disk
 * and only breaks later, in `formatArticleDateShort`/the sitemap/the render
 * switch, far from where the bad data actually came from.
 *
 * Caps below match the audit's field matrix, not an invented number.
 */

/** A local `/`-prefixed path (image pipeline output, an admin upload) or a real http(s) URL. Never `data:`. */
const safeUrl = z.string().refine(isSafeHref, "URL tidak valid atau tidak diizinkan.");

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD.")
  .refine(isValidCalendarDate, "Tanggal tidak valid.");

const knowledgeBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    text: z.string().min(1).max(20000),
  }),
  z.object({
    type: z.literal("heading"),
    text: z.string().min(1).max(20000),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1).max(20000)).min(1).max(200),
  }),
  z.object({
    type: z.literal("callout"),
    title: z.string().min(1).max(200),
    text: z.string().min(1).max(20000),
  }),
  z.object({
    type: z.literal("image"),
    src: safeUrl,
    alt: z.string().min(1).max(500),
    caption: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("video"),
    url: safeUrl,
    videoId: z.string().max(50).optional(),
    title: z.string().max(200).optional(),
  }),
]);

export const articleSchema = z.object({
  slug: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  seoTitle: z.string().max(200).optional(),
  summary: z.string().min(1).max(500),
  coverImage: safeUrl.optional(),
  coverImageAlt: z.string().max(500).optional(),
  readingMinutes: z.number().int().min(1).max(120),
  publishedAt: calendarDate,
  updatedAt: calendarDate.optional(),
  status: z.enum(["aktif", "tidak_aktif"]).optional(),
  body: z.array(knowledgeBlockSchema).min(1).max(200),
});

export type ArticleInput = z.infer<typeof articleSchema>;

/** Flattens Zod issues into the `{ field: message }` shape the admin editor already renders. */
export function formatArticleIssues(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
