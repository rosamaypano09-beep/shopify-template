import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getCatalogSource } from "./source";
import type { ShopPolicy } from "./types";

/** The store's legal policies, exactly as written in Shopify admin (Settings > Policies). */
export async function getPolicies(): Promise<ShopPolicy[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("policies");
  return getCatalogSource().getPolicies();
}
