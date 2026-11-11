"use server";

import type { NavItem } from "@/config/types";
import { logger } from "@/lib/logger";
import { menuToNavItems } from "@/lib/navigation";
import { getMenu } from "@/lib/shopify";
import { isAuthorized } from "./session";

export type ImportMenuResult = { ok: true; items: NavItem[] } | { ok: false; error: string };

/** Reads a Shopify menu (Online Store > Navigation) as editable menu items. Nothing is saved until the form is. */
export async function importShopifyMenuAction(handle: string): Promise<ImportMenuResult> {
  if (!(await isAuthorized())) return { ok: false, error: "Your session has ended. Sign in again." };
  if (!/^[a-z0-9][a-z0-9-_]{0,200}$/i.test(handle)) return { ok: false, error: "Enter a menu handle such as main-menu." };
  try {
    const items = menuToNavItems(await getMenu(handle));
    if (!items.length) return { ok: false, error: `Shopify has no menu called "${handle}", or it is empty.` };
    return { ok: true, items };
  } catch (error) {
    logger.error("Shopify menu import failed", { scope: "dashboard", error });
    return { ok: false, error: "Shopify could not be reached. Try again in a moment." };
  }
}
