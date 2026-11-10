import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CATALOG_CACHE_LIFE, getCatalogSource, tags } from "./source";
import type { Collection, CollectionWithProducts, ProductListOptions } from "./types";

/** A collection and a page of its products, or null when it does not exist. */
export async function getCollection(
  handle: string,
  options: ProductListOptions = {},
): Promise<CollectionWithProducts | null> {
  "use cache";
  cacheLife(CATALOG_CACHE_LIFE);
  cacheTag(tags.collections, tags.collection(handle), tags.products);
  return getCatalogSource().getCollection(handle, options);
}

export async function getCollections(first = 50): Promise<Collection[]> {
  "use cache";
  cacheLife(CATALOG_CACHE_LIFE);
  cacheTag(tags.collections);
  return getCatalogSource().getCollections(first);
}
