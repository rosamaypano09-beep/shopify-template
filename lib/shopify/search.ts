import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CATALOG_CACHE_LIFE, getCatalogSource, tags } from "./source";
import type { PredictiveSearchResult, SearchOptions, SearchResult } from "./types";

/** Longest query sent to Shopify. Keeps junk input out of the cache and the API. */
export const MAX_QUERY_LENGTH = 80;

export const cleanQuery = (query: string) => query.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);

/** Full product search for the results page. */
export async function searchProducts(query: string, options: SearchOptions = {}): Promise<SearchResult> {
  "use cache";
  cacheLife(CATALOG_CACHE_LIFE);
  cacheTag(tags.products);
  return getCatalogSource().search(query, options);
}

/** A few products, collections and suggested terms for search-as-you-type. */
export async function predictiveSearch(query: string): Promise<PredictiveSearchResult> {
  "use cache";
  cacheLife(CATALOG_CACHE_LIFE);
  cacheTag(tags.products, tags.collections);
  return getCatalogSource().predictiveSearch(query);
}
