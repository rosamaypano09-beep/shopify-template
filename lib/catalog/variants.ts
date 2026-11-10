import type { Product, ProductVariant } from "@/lib/shopify/types";

export type Selection = Record<string, string>;

const matches = (variant: ProductVariant, selection: Selection) =>
  variant.selectedOptions.every((option) => selection[option.name] === option.value);

/** The variant for a complete selection, or null when that combination does not exist. */
export function findVariant(product: Product, selection: Selection): ProductVariant | null {
  return product.variants.find((variant) => matches(variant, selection)) ?? null;
}

export function selectionOf(variant: ProductVariant): Selection {
  return Object.fromEntries(variant.selectedOptions.map((option) => [option.name, option.value]));
}

/** First variant that can be bought; falls back to the first variant when all are sold out. */
export function defaultVariant(product: Product): ProductVariant | null {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0] ?? null;
}

/** Variant ids are long global ids; the last segment is enough for a shareable URL. */
export const shortVariantId = (id: string) => id.split("/").pop() ?? id;

export function variantFromShortId(product: Product, shortId: string | null): ProductVariant | null {
  if (!shortId) return null;
  return product.variants.find((variant) => shortVariantId(variant.id) === shortId) ?? null;
}

export type ValueState = "available" | "sold-out" | "missing";

/**
 * What choosing `value` for `optionName` would lead to, keeping the other
 * current choices: a buyable variant, a sold-out one, or no variant at all.
 */
export function valueState(product: Product, selection: Selection, optionName: string, value: string): ValueState {
  const variant = findVariant(product, { ...selection, [optionName]: value });
  if (!variant) return "missing";
  return variant.availableForSale ? "available" : "sold-out";
}

/** Single-variant products need no picker (Shopify calls their one option "Title"). */
export function hasRealOptions(product: Product): boolean {
  return product.variants.length > 1;
}
