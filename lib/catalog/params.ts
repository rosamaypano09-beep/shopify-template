import type { ProductFilterGroup, ProductSort, SearchSort } from "@/lib/shopify/types";

/**
 * Listing state lives in the URL, so a filtered view can be shared, bookmarked
 * and reached with the back button:
 *
 *   /collections/dresses?sort=price-asc&f=filter.v.availability.1&min=500&show=48
 */

export const PAGE_SIZE = 24;
export const MAX_SHOWN = 240;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

export const SEARCH_SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
];

export interface ListingState {
  sort: string;
  /** How many products to show. Grows by PAGE_SIZE with "Show more". */
  show: number;
  /** Ids of the selected filter values. */
  filterIds: string[];
  min: number | null;
  max: number | null;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const all = (value: string | string[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

function toPrice(value: string | undefined): number | null {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function parseListingParams(params: RawParams, defaultSort: string): ListingState {
  const show = Number(first(params.show));
  return {
    sort: first(params.sort) ?? defaultSort,
    show: Number.isInteger(show) ? Math.min(MAX_SHOWN, Math.max(PAGE_SIZE, show)) : PAGE_SIZE,
    filterIds: [...new Set(all(params.f).filter((id) => id.length <= 200))].slice(0, 30),
    min: toPrice(first(params.min)),
    max: toPrice(first(params.max)),
  };
}

export function isSort<T extends string>(value: string, options: { value: T }[]): value is T {
  return options.some((option) => option.value === value);
}

/** Builds a link to the same listing with some of its state changed. */
export function listingHref(
  path: string,
  state: ListingState,
  defaultSort: string,
  extra: Record<string, string> = {},
): string {
  const query = new URLSearchParams(extra);
  if (state.sort !== defaultSort) query.set("sort", state.sort);
  for (const id of state.filterIds) query.append("f", id);
  if (state.min !== null) query.set("min", String(state.min));
  if (state.max !== null) query.set("max", String(state.max));
  if (state.show > PAGE_SIZE) query.set("show", String(state.show));
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

export function toggleFilter(state: ListingState, id: string): ListingState {
  const selected = state.filterIds.includes(id);
  return {
    ...state,
    show: PAGE_SIZE,
    filterIds: selected ? state.filterIds.filter((other) => other !== id) : [...state.filterIds, id],
  };
}

export function clearFilters(state: ListingState): ListingState {
  return { ...state, show: PAGE_SIZE, filterIds: [], min: null, max: null };
}

export function activeFilterCount(state: ListingState): number {
  return state.filterIds.length + (state.min !== null || state.max !== null ? 1 : 0);
}

/**
 * Turns the selected ids back into the `input` strings Shopify expects.
 * Ids that are not in the collection's own filter list are ignored, so a
 * hand-edited URL can never send arbitrary input to Shopify.
 */
export function filterInputs(state: ListingState, groups: ProductFilterGroup[]): string[] {
  const inputs: string[] = [];
  for (const group of groups) {
    if (group.type === "PRICE_RANGE") continue;
    for (const value of group.values) {
      if (state.filterIds.includes(value.id)) inputs.push(value.input);
    }
  }
  if ((state.min !== null || state.max !== null) && groups.some((group) => group.type === "PRICE_RANGE")) {
    const price: { min?: number; max?: number } = {};
    if (state.min !== null) price.min = state.min;
    if (state.max !== null) price.max = state.max;
    inputs.push(JSON.stringify({ price }));
  }
  return inputs;
}
