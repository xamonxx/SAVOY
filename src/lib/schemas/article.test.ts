import { describe, expect, it } from "vitest";

import { articleSchema, formatArticleIssues } from "@/lib/schemas/article";

function validArticle() {
  return {
    slug: "kitchen-set-minimalis",
    category: "Kitchen Set",
    title: "Kitchen Set Minimalis",
    summary: "Ringkasan singkat artikel.",
    readingMinutes: 5,
    publishedAt: "2026-01-15",
    body: [{ type: "paragraph" as const, text: "Isi artikel." }],
  };
}

describe("articleSchema", () => {
  it("accepts a minimal valid article", () => {
    const result = articleSchema.safeParse(validArticle());
    expect(result.success).toBe(true);
  });

  it("rejects an invalid publishedAt date", () => {
    const result = articleSchema.safeParse({
      ...validArticle(),
      publishedAt: "2026-02-30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a body block that isn't one of the known types", () => {
    const result = articleSchema.safeParse({
      ...validArticle(),
      body: [{ type: "not-a-real-block", text: "x" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an image block with an unsafe src (data: URL)", () => {
    const result = articleSchema.safeParse({
      ...validArticle(),
      body: [
        {
          type: "image",
          src: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
          alt: "test",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a readingMinutes of 0 or a non-integer", () => {
    expect(articleSchema.safeParse({ ...validArticle(), readingMinutes: 0 }).success).toBe(false);
    expect(articleSchema.safeParse({ ...validArticle(), readingMinutes: 4.5 }).success).toBe(false);
  });

  it("rejects an empty body array", () => {
    const result = articleSchema.safeParse({ ...validArticle(), body: [] });
    expect(result.success).toBe(false);
  });

  it("enforces the summary length cap", () => {
    const result = articleSchema.safeParse({
      ...validArticle(),
      summary: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("formatArticleIssues", () => {
  it("flattens Zod issues into a field-keyed map, keeping only the first per field", () => {
    const result = articleSchema.safeParse({
      ...validArticle(),
      slug: "",
      readingMinutes: -1,
    });
    expect(result.success).toBe(false);
    if (result.success) return;

    const fieldErrors = formatArticleIssues(result.error);
    expect(Object.keys(fieldErrors)).toEqual(expect.arrayContaining(["slug", "readingMinutes"]));
    expect(typeof fieldErrors.slug).toBe("string");
  });
});
