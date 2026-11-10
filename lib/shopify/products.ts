import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CATALOG_CACHE_LIFE, getCatalogSource, tags } from "./source";
import type { PageInfo, Product, ProductListOptions, ProductSummary } from "./types";

/** One product with variants and gallery, or null when it does not exist (deleted, unpublished). */
export async function getProduct(handle: string): Promise<Product | null> {
  "use cache";
  cacheLife(CATALOG_CACHE_LIFE);
  cacheTag(tags.products, tags.product(handle));
  return getCatalogSource().getProduct(handle);
}

export async function getProducts(
  options: ProductListOptions = {},
): Promise<{ products: ProductSummary[]; pageInfo: PageInfo }> {
  "use cache";
  cacheLife(CATALOG_CACHE_LIFE);
  cacheTag(tags.products);
  return getCatalogSource().getProducts(options);
}
