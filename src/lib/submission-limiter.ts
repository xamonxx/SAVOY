/**
 * In-memory sliding-window quota for public form submissions (pasal 1, audit
 * SAV-001).
 *
 * Different shape from `rate-limiter.ts` on purpose: that one counts *failed*
 * login attempts and locks out on the Nth failure. This one counts *every*
 * successful-looking submission (a review or a survey lead), win or lose,
 * because the thing being bounded here is submission volume itself, not
 * wrong-password guesses.
 *
 * Max 5 submissions per action per IP per 10-minute window. Keyed separately
 * per action (`review` vs `survey`) so a burst on one form can't lock a
 * visitor out of the other.
 */

import fs from "node:fs";
import path from "node:path";

export type SubmissionAction = "review" | "survey";

type WindowRecord = {
  /** Timestamps (ms) of submissions still inside the current window. */
  timestamps: number[];
};

const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RECORD_TTL_MS = 60 * 60 * 1000; // 1 hour memory cleanup

/**
 * Persisted the same way `rate-limiter.ts` persists login attempts: single
 * Node process (Hostinger, no horizontal scaling - see AGENTS.md), so a plain
 * JSON file surviving a restart is enough. Not committed - runtime bookkeeping,
 * not content. See .gitignore.
 */
const STATE_FILE = path.join(process.cwd(), "src", "data", ".submission-limit-state.json");

type PersistedState = Partial<Record<SubmissionAction, Record<string, WindowRecord>>>;

function readPersistedState(): Record<SubmissionAction, Record<string, WindowRecord>> {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      review: parsed.review && typeof parsed.review === "object" ? parsed.review : {},
      survey: parsed.survey && typeof parsed.survey === "object" ? parsed.survey : {},
    };
  } catch {
    // Missing on first run, or corrupt - start clean rather than let a bad
    // file take the public forms down.
    return { review: {}, survey: {} };
  }
}

const stores: Record<SubmissionAction, Map<string, WindowRecord>> = {
  review: new Map(Object.entries(readPersistedState().review)),
  survey: new Map(Object.entries(readPersistedState().survey)),
};

let writeTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced so a burst of submissions costs at most one disk write. */
function schedulePersist() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
      const snapshot: PersistedState = {
        review: Object.fromEntries(stores.review),
        survey: Object.fromEntries(stores.survey),
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(snapshot), "utf-8");
    } catch (error) {
      console.error("[submission-limiter] Failed to persist state:", error);
    }
  }, 50);
}

function cleanupStale(store: Map<string, WindowRecord>, now: number) {
  if (store.size <= 500) return;
  for (const [key, record] of store.entries()) {
    const last = record.timestamps[record.timestamps.length - 1];
    if (!last || now - last > RECORD_TTL_MS) store.delete(key);
  }
}

export type SubmissionLimitStatus = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * Checks whether `ip` may submit `action` right now, without recording
 * anything. Call this before doing any side effect (save/email/webhook).
 */
export function checkSubmissionLimit(action: SubmissionAction, ip: string): SubmissionLimitStatus {
  const now = Date.now();
  const store = stores[action];
  const record = store.get(ip);
  if (!record) return { allowed: true, retryAfterSeconds: 0 };

  const withinWindow = record.timestamps.filter((t) => now - t < WINDOW_MS);
  if (withinWindow.length < MAX_SUBMISSIONS) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const oldest = withinWindow[0];
  const retryAfterSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
  return { allowed: false, retryAfterSeconds };
}

/** Records a submission attempt (call only after `checkSubmissionLimit` allowed it). */
export function recordSubmission(action: SubmissionAction, ip: string): void {
  const now = Date.now();
  const store = stores[action];
  const record = store.get(ip) ?? { timestamps: [] };
  record.timestamps = [...record.timestamps.filter((t) => now - t < WINDOW_MS), now];
  store.set(ip, record);
  schedulePersist();
  cleanupStale(store, now);
}
