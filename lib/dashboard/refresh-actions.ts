"use server";

import { updateTag } from "next/cache";
import { tags } from "@/lib/shopify/source";
import { isAuthorized } from "./session";

/**
 * Clears everything read from Shopify (products, collections, blog posts,
 * pages, menus, policies), so the next page view fetches it fresh. Use after
 * publishing something in Shopify admin that should show at once.
 */
export async function refreshShopifyContentAction(): Promise<{ ok: boolean; note: string }> {
  if (!(await isAuthorized())) return { ok: false, note: "Your session has ended. Sign in again." };
  for (const tag of [tags.products, tags.collections, "content", "policies", "orders-count"]) updateTag(tag);
  return { ok: true, note: "Refreshed. The site now shows the latest from Shopify." };
}
