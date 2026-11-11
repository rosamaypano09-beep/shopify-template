import type { Money } from "@/lib/shopify/types";

const formatters = new Map<string, Intl.NumberFormat>();

/**
 * Formats a Shopify money value. The currency always comes from the data and
 * the symbol from Intl, so no component ever hardcodes "₱" or "$".
 */
export function formatMoney(money: Money, locale: string): string {
  const key = `${locale}:${money.currencyCode}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency: money.currencyCode });
    formatters.set(key, formatter);
  }
  const amount = Number(money.amount);
  const formatted = formatter.format(amount);
  // Whole amounts read better without ".00".
  return Number.isInteger(amount) ? formatted.replace(/[.,]00(?=\D*$)/, "") : formatted;
}

/** Whole-number percentage saved, or null when there is no real discount. */
export function discountPercent(price: Money, compareAt: Money | null): number | null {
  if (!compareAt) return null;
  const was = Number(compareAt.amount);
  const now = Number(price.amount);
  if (!(was > now) || was <= 0) return null;
  return Math.round(((was - now) / was) * 100);
}

/** A publish date such as "12 March 2026", in the store's language. */
export function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** "2,000+" → { prefix: "", number: 2000, decimals: 0, suffix: "+" }. Null when there is no number to count. */
export function parseStatValue(value: string): { prefix: string; number: number; decimals: number; suffix: string } | null {
  const match = /^(\D*?)(\d[\d,.\s]*)(.*)$/.exec(value.trim());
  if (!match) return null;
  const digits = match[2].trim();
  // A comma followed by exactly three digits is a thousands separator; otherwise it may be a decimal comma.
  const normalized = /,\d{3}(\D|$)/.test(digits) || !digits.includes(".") ? digits.replace(/[,\s]/g, "") : digits.replace(/[\s,]/g, "");
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  const decimals = normalized.includes(".") ? normalized.split(".")[1].length : 0;
  return { prefix: match[1], number, decimals, suffix: match[3] };
}

/** A real count shown as a proof number: rounded down, never up, with "+" when rounding hid some. */
export function statFromCount(count: number, roundDown: "none" | "10" | "100" | "1000" = "none", locale = "en", plus = false): string {
  const step = roundDown === "none" ? 1 : Number(roundDown);
  const shown = Math.floor(count / step) * step;
  const formatted = new Intl.NumberFormat(locale).format(shown);
  return shown < count || plus ? `${formatted}+` : formatted;
}
