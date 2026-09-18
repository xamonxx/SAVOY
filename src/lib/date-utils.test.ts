import { describe, expect, it } from "vitest";

import { isValidCalendarDate } from "@/lib/date-utils";

describe("isValidCalendarDate", () => {
  it("accepts a real calendar date", () => {
    expect(isValidCalendarDate("2026-09-18")).toBe(true);
  });

  it("accepts the last day of February in a leap year", () => {
    expect(isValidCalendarDate("2024-02-29")).toBe(true);
  });

  it("rejects February 29th in a non-leap year", () => {
    expect(isValidCalendarDate("2026-02-29")).toBe(false);
  });

  it("rejects a day that overflows its month instead of silently rolling over", () => {
    // `Date.UTC` would happily turn this into 2026-10-01.
    expect(isValidCalendarDate("2026-09-31")).toBe(false);
  });

  it("rejects a month number that overflows the calendar", () => {
    expect(isValidCalendarDate("2026-13-01")).toBe(false);
  });

  it("rejects strings that don't match the YYYY-MM-DD shape", () => {
    expect(isValidCalendarDate("18-09-2026")).toBe(false);
    expect(isValidCalendarDate("2026/09/18")).toBe(false);
    expect(isValidCalendarDate("not-a-date")).toBe(false);
    expect(isValidCalendarDate("")).toBe(false);
  });
});
