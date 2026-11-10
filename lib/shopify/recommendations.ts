import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getCatalogSource, tags } from "./source";
import type { ProductSummary } from "./types";

/** Products Shopify considers related to this one. Never invented: empty when Shopify has none. */
export async function getRecommendations(productId: string): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.products);
  return getCatalogSource().getRecommendations(productId);
}
