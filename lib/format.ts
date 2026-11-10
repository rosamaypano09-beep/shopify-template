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
