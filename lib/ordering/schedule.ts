import type { OrderingConfig } from "@/config/types";

/**
 * Which dates can be chosen for pickup or delivery. Pure and time-zone aware,
 * so the bag (in the browser) and the server (which re-checks every choice)
 * always agree. All dates are YYYY-MM-DD in the store's time zone.
 */

/** Hidden order note with the chosen date as YYYY-MM-DD, so the bag can show the choice again and spot one that has expired. */
export const SCHEDULE_DATE_KEY = "_schedule_date";

type Rules = Pick<OrderingConfig, "openDays" | "cutoffHour" | "minDaysAhead" | "maxDaysAhead" | "closedDates">;

/** Today's date and the current hour where the store is. */
export function storeNow(now: Date, timeZone: string): { year: number; month: number; day: number; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour) };
}

const iso = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Every date a customer may choose, earliest first. */
export function availableDates(now: Date, timeZone: string, rules: Rules): string[] {
  const today = storeNow(now, timeZone);
  const base = Date.UTC(today.year, today.month - 1, today.day);
  // Past the cut-off, the earliest date moves one day later.
  const first = Math.max(0, rules.minDaysAhead) + (today.hour >= rules.cutoffHour ? 1 : 0);
  const closed = new Set(rules.closedDates);
  const dates: string[] = [];
  for (let offset = first; offset <= Math.max(first, rules.maxDaysAhead); offset++) {
    const time = base + offset * 86_400_000;
    const weekday = new Date(time).getUTCDay();
    const date = iso(time);
    if (rules.openDays.includes(weekday) && !closed.has(date)) dates.push(date);
  }
  return dates;
}

export function isAllowedChoice(now: Date, timeZone: string, rules: Rules & Pick<OrderingConfig, "timeSlots">, date: string, time: string): boolean {
  return availableDates(now, timeZone, rules).includes(date) && rules.timeSlots.includes(time);
}

/** "2026-11-14" → "Friday, 14 November 2026" in the store's language. */
export function formatScheduleDate(date: string, locale: string, style: "long" | "short" = "long"): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: style,
    day: "numeric",
    month: style,
    ...(style === "long" ? { year: "numeric" } : {}),
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
