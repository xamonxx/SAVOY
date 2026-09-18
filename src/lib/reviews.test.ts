import fs from "fs/promises";
import os from "os";
import path from "path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `reviews.ts` resolves its data file from `process.cwd()` at module-load
 * time, so each test points `cwd()` at a fresh temp directory and re-imports
 * the module fresh - real fixtures on disk, never the actual
 * `src/data/public-reviews.json`.
 */
async function loadReviewsModule(cwd: string) {
  vi.resetModules();
  vi.spyOn(process, "cwd").mockReturnValue(cwd);
  return import("@/lib/reviews");
}

function reviewsFilePath(cwd: string) {
  return path.join(cwd, "src", "data", "public-reviews.json");
}

const validInput = {
  author: "Budi",
  address: "Bandung",
  rating: 5,
  description: "Pelayanan sangat memuaskan.",
};

describe("reviews fail-closed reads", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "savoy-reviews-"));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("provisions an empty store and succeeds when no file exists yet (ENOENT)", async () => {
    const { savePublicReview } = await loadReviewsModule(tmpDir);

    const result = await savePublicReview(validInput);

    expect(result.success).toBe(true);
    const onDisk = JSON.parse(await fs.readFile(reviewsFilePath(tmpDir), "utf-8"));
    expect(onDisk).toHaveLength(1);
    expect(onDisk[0].moderationStatus).toBe("pending");
  });

  it("refuses to save, and leaves the file untouched, when it contains invalid JSON", async () => {
    const filePath = reviewsFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, "{ this is not valid json", "utf-8");

    const { savePublicReview } = await loadReviewsModule(tmpDir);
    const result = await savePublicReview(validInput);

    expect(result.success).toBe(false);
    // The whole point of failing closed: a corrupt file must never get
    // silently overwritten with `[newReview]`.
    expect(await fs.readFile(filePath, "utf-8")).toBe("{ this is not valid json");
  });

  it("refuses to save when the file parses but isn't an array", async () => {
    const filePath = reviewsFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ unexpected: "shape" }), "utf-8");

    const { savePublicReview } = await loadReviewsModule(tmpDir);
    const result = await savePublicReview(validInput);

    expect(result.success).toBe(false);
  });

  it("appends to, rather than replaces, an existing valid file", async () => {
    const filePath = reviewsFilePath(tmpDir);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const existing = [
      {
        id: "rev-existing",
        author: "Existing Reviewer",
        address: "Jakarta",
        rating: 4,
        description: "Sudah ada sebelumnya.",
        createdAt: "2026-01-01T00:00:00.000Z",
        moderationStatus: "approved",
      },
    ];
    await fs.writeFile(filePath, JSON.stringify(existing), "utf-8");

    const { savePublicReview } = await loadReviewsModule(tmpDir);
    const result = await savePublicReview(validInput);

    expect(result.success).toBe(true);
    const onDisk = JSON.parse(await fs.readFile(filePath, "utf-8"));
    expect(onDisk).toHaveLength(2);
    expect(onDisk.some((r: { id: string }) => r.id === "rev-existing")).toBe(true);
  });
});
