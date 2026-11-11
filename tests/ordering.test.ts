import { describe, expect, it } from "vitest";
import { availableDates, formatScheduleDate, isAllowedChoice } from "@/lib/ordering/schedule";

// Thursday to Saturday, 4 pm cut-off, next day at the earliest, two weeks ahead.
const rules = { openDays: [4, 5, 6], cutoffHour: 16, minDaysAhead: 1, maxDaysAhead: 14, closedDates: [] as string[], timeSlots: ["10:00 AM – 12:00 PM"] };
const manila = "Asia/Manila";

describe("pickup and delivery dates", () => {
  it("offers tomorrow when ordering before the cut-off, in the store's time zone", () => {
    // Wednesday 11 Nov 2026, 10:00 in Manila (02:00 UTC).
    const dates = availableDates(new Date("2026-11-11T02:00:00Z"), manila, rules);
    expect(dates.slice(0, 4)).toEqual(["2026-11-12", "2026-11-13", "2026-11-14", "2026-11-19"]);
  });

  it("moves the earliest date one day later after the cut-off", () => {
    // Wednesday 11 Nov 2026, 17:00 in Manila (09:00 UTC).
    expect(availableDates(new Date("2026-11-11T09:00:00Z"), manila, rules)[0]).toBe("2026-11-13");
  });

  it("uses Manila's date, not the server's, around midnight", () => {
    // 23:30 UTC on Wednesday is already 07:30 Thursday in Manila: earliest is Friday.
    expect(availableDates(new Date("2026-11-11T23:30:00Z"), manila, rules)[0]).toBe("2026-11-13");
  });

  it("skips closed dates and only accepts listed times", () => {
    const now = new Date("2026-11-11T02:00:00Z");
    const closed = { ...rules, closedDates: ["2026-11-13"] };
    expect(availableDates(now, manila, closed)).not.toContain("2026-11-13");
    expect(isAllowedChoice(now, manila, rules, "2026-11-12", "10:00 AM – 12:00 PM")).toBe(true);
    expect(isAllowedChoice(now, manila, rules, "2026-11-12", "3:00 AM")).toBe(false);
    expect(isAllowedChoice(now, manila, rules, "2026-11-15", "10:00 AM – 12:00 PM")).toBe(false); // a Sunday
  });

  it("formats a date for the order", () => {
    expect(formatScheduleDate("2026-11-13", "en-PH")).toBe("Friday, November 13, 2026");
  });
});
