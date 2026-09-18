import fs from "fs/promises";
import os from "os";
import path from "path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { KnowledgeArticle } from "@/types";

/**
 * Same technique as `reviews.test.ts`: `articles.ts` resolves its data file
 * from `process.cwd()` at module-load time, so pointing `cwd()` at a fresh
 * temp directory and re-importing gives each test real, isolated fixtures
 * instead of touching `src/data/custom-articles.json`.
 */
async function loadArticlesModule(cwd: string) {
  vi.resetModules();
  vi.spyOn(process, "cwd").mockReturnValue(cwd);
  return import("@/lib/articles");
}

function articlesFilePath(cwd: string) {
  return path.join(cwd, "src", "data", "custom-articles.json");
}

function makeArticle(overrides: Partial<KnowledgeArticle> = {}): KnowledgeArticle {
  return {
    slug: "artikel-uji",
    category: "Uji Coba",
    title: "Artikel Uji Coba",
    summary: "Ringkasan artikel uji.",
    readingMinutes: 3,
    publishedAt: "2026-01-01",
    body: [{ type: "paragraph", text: "Isi artikel uji." }],
    ...overrides,
  };
}

describe("articles fail-closed reads", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "savoy-articles-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("provisions an empty store and succeeds when no file exists yet (ENOENT)", async () => {
    const { saveArticle } = await loadArticlesModule(tmpDir);

    const result = await saveArticle(makeArticle());

    expect(result.success).toBe(true);
    const onDisk = JSON.parse(await fs.readFile(articlesFilePath(tmpDir), "utf-8"));
    expect(onDisk).toHaveLength(1);
  });

  it("refuses to save, and leaves the file untouched, when it contains invalid JSON", async () => {
    const filePath = articlesFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "{ not valid json", "utf-8");

    const { saveArticle } = await loadArticlesModule(tmpDir);
    const result = await saveArticle(makeArticle());

    expect(result.success).toBe(false);
    expect(await fs.readFile(filePath, "utf-8")).toBe("{ not valid json");
  });

  it("refuses to save when the file parses but isn't an array", async () => {
    const filePath = articlesFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ unexpected: "shape" }), "utf-8");

    const { saveArticle } = await loadArticlesModule(tmpDir);
    const result = await saveArticle(makeArticle());

    expect(result.success).toBe(false);
  });
});

describe("deleteArticle baseline-override guard (SAV-009)", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "savoy-articles-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("refuses to delete a custom record that overrides a baseline slug", async () => {
    const filePath = articlesFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    // "plywood-mdf-atau-hmr" is a real baseline slug from src/data/knowledge.ts.
    await fs.writeFile(
      filePath,
      JSON.stringify([makeArticle({ slug: "plywood-mdf-atau-hmr", status: "tidak_aktif" })]),
      "utf-8"
    );

    const { deleteArticle } = await loadArticlesModule(tmpDir);
    const result = await deleteArticle("plywood-mdf-atau-hmr");

    expect(result.success).toBe(false);
    // Refused, not just reported as failed: the override must still be on disk.
    const onDisk = JSON.parse(await fs.readFile(filePath, "utf-8"));
    expect(onDisk).toHaveLength(1);
  });

  it("permanently deletes a custom article that has no baseline counterpart", async () => {
    const filePath = articlesFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify([makeArticle({ slug: "artikel-uji" })]), "utf-8");

    const { deleteArticle } = await loadArticlesModule(tmpDir);
    const result = await deleteArticle("artikel-uji");

    expect(result.success).toBe(true);
    const onDisk = JSON.parse(await fs.readFile(filePath, "utf-8"));
    expect(onDisk).toHaveLength(0);
  });
});
