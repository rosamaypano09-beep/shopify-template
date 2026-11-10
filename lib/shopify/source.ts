import "server-only";
import { getShopifyConnection } from "@/lib/env";
import { liveSource } from "./live";
import { mockSource } from "./mock/source";
import { liveCartSource } from "./cart-live";
import { mockCartSource } from "./mock/cart";
import type { CartSource, CatalogSource } from "./types";

/** Live Shopify store, or the demo catalog when none is connected. */
export function getCatalogSource(): CatalogSource {
  return getShopifyConnection().mode === "live" ? liveSource : mockSource;
}

/** Cart operations. Never cached: a cart belongs to one visitor. */
export function getCartSource(): CartSource {
  return getShopifyConnection().mode === "live" ? liveCartSource : mockCartSource;
}

/** Cache lifetime for catalog reads. Short, so price and stock changes show up within minutes. */
export const CATALOG_CACHE_LIFE = "minutes" as const;

/** Cache tags. A Shopify webhook can later call revalidateTag() with these for instant updates. */
export const tags = {
  products: "products",
  product: (handle: string) => `product:${handle}`,
  collections: "collections",
  collection: (handle: string) => `collection:${handle}`,
};
