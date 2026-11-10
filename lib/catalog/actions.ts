"use server";

import { z } from "zod";
import { logger } from "@/lib/logger";
import { getProduct } from "@/lib/shopify/products";
import type { Product, ProductSummary } from "@/lib/shopify/types";

/** Read-only catalog lookups for browser-side features (wishlist, recently viewed, quick view). */

const handle = z.string().regex(/^[a-z0-9][a-z0-9-_]{0,200}$/i);

function toSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    availableForSale: product.availableForSale,
    tags: product.tags,
    featuredImage: product.featuredImage,
    secondaryImage: product.secondaryImage,
    price: product.price,
    hasPriceRange: product.hasPriceRange,
    compareAtPrice: product.compareAtPrice,
    rating: product.rating,
  };
}

/** Products for the given handles, in the same order. Unknown or deleted handles are skipped. */
export async function getProductSummariesAction(handles: string[]): Promise<ProductSummary[]> {
  const parsed = z.array(handle).max(24).safeParse(handles);
  if (!parsed.success) return [];
  try {
    const products = await Promise.all(parsed.data.map((value) => getProduct(value)));
    return products.filter((product): product is Product => product !== null).map(toSummary);
  } catch (error) {
    logger.error("Product lookup failed", { scope: "catalog", error });
    return [];
  }
}

export async function getProductAction(value: string): Promise<Product | null> {
  const parsed = handle.safeParse(value);
  if (!parsed.success) return null;
  try {
    return await getProduct(parsed.data);
  } catch (error) {
    logger.error("Product lookup failed", { scope: "catalog", error });
    return null;
  }
}
