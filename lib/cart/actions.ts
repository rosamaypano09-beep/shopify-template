"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getSiteConfig } from "@/config";
import { logger } from "@/lib/logger";
import { formatScheduleDate, isAllowedChoice, SCHEDULE_DATE_KEY } from "@/lib/ordering/schedule";
import { ShopifyError } from "@/lib/shopify/errors";
import { getCartSource } from "@/lib/shopify/source";
import type { Cart } from "@/lib/shopify/types";

/**
 * Cart server actions. The browser never talks to Shopify directly and never
 * sees an access token: it calls these, and they call the Storefront API.
 * The only thing stored in the browser is the cart id, in an httpOnly cookie.
 */

const CART_COOKIE = "ce_cart";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export type CartResult = { ok: true; cart: Cart | null } | { ok: false; error: string };

const id = z.string().min(1).max(600);
const attribute = z.object({ key: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(250) });
const addInput = z.object({ merchandiseId: id, quantity: z.number().int().min(1).max(99), attributes: z.array(attribute).max(5).optional() });
const updateInput = z.object({ lineId: id, quantity: z.number().int().min(0).max(99) });
const codeInput = z.string().trim().min(1).max(60);

async function readCartId() {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}

async function writeCartId(cartId: string) {
  (await cookies()).set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

async function clearCartId() {
  (await cookies()).delete(CART_COOKIE);
}

function fail(action: string, error: unknown): CartResult {
  // Shopify's own messages ("Only 2 left in stock") are safe and useful to show.
  if (error instanceof ShopifyError && error.kind === "user") return { ok: false, error: error.message };
  logger.error("Cart action failed", { scope: "cart", action, error });
  return { ok: false, error: "We couldn't update your cart. Check your connection and try again." };
}

/** Runs a change against the visitor's cart and stores the (possibly new) cart id. */
async function mutate(action: string, change: (cartId: string) => Promise<Cart>): Promise<CartResult> {
  const cartId = await readCartId();
  if (!cartId) return { ok: false, error: "Your cart is empty." };
  try {
    const cart = await change(cartId);
    await writeCartId(cart.id);
    return { ok: true, cart };
  } catch (error) {
    return fail(action, error);
  }
}

export async function getCartAction(): Promise<CartResult> {
  const cartId = await readCartId();
  if (!cartId) return { ok: true, cart: null };
  try {
    const cart = await getCartSource().getCart(cartId);
    // Shopify deletes a cart once its order is placed, or after long inactivity.
    if (!cart) await clearCartId();
    return { ok: true, cart };
  } catch (error) {
    return fail("get", error);
  }
}

export async function addToCartAction(input: {
  merchandiseId: string;
  quantity: number;
  /** Notes kept on the line and passed to the order, for example the flavours of a bundle. */
  attributes?: { key: string; value: string }[];
}): Promise<CartResult> {
  const parsed = addInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That item can't be added. Refresh the page and try again." };
  const source = getCartSource();

  try {
    const cartId = await readCartId();
    let cart: Cart;
    if (cartId && (await source.getCart(cartId))) {
      cart = await source.addLines(cartId, [parsed.data]);
    } else {
      cart = await source.createCart([parsed.data]);
    }
    await writeCartId(cart.id);
    return { ok: true, cart };
  } catch (error) {
    return fail("add", error);
  }
}

export async function updateCartLineAction(input: { lineId: string; quantity: number }): Promise<CartResult> {
  const parsed = updateInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a quantity between 1 and 99." };
  const { lineId, quantity } = parsed.data;

  return mutate("update", (cartId) =>
    quantity === 0
      ? getCartSource().removeLines(cartId, [lineId])
      : getCartSource().updateLines(cartId, [{ id: lineId, quantity }]),
  );
}

export async function removeCartLineAction(lineId: string): Promise<CartResult> {
  const parsed = id.safeParse(lineId);
  if (!parsed.success) return { ok: false, error: "That item can't be removed. Refresh the page and try again." };
  return mutate("remove", (cartId) => getCartSource().removeLines(cartId, [parsed.data]));
}

/** Replaces the cart's discount codes. Shopify decides whether each one applies. */
export async function setDiscountCodesAction(codes: string[]): Promise<CartResult> {
  const parsed = z.array(codeInput).max(5).safeParse(codes);
  if (!parsed.success) return { ok: false, error: "Enter a discount code." };
  return mutate("discount", (cartId) => getCartSource().updateDiscountCodes(cartId, parsed.data));
}

/**
 * "Buy now": a separate one-item cart sent straight to checkout, leaving the
 * visitor's main cart untouched.
 */
export async function buyNowAction(input: {
  merchandiseId: string;
  quantity: number;
}): Promise<{ ok: true; checkoutUrl: string } | { ok: false; error: string }> {
  const parsed = addInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That item can't be bought. Refresh the page and try again." };
  try {
    const cart = await getCartSource().createCart([parsed.data]);
    if (!cart.checkoutUrl) return { ok: false, error: "Checkout opens once a Shopify store is connected." };
    return { ok: true, checkoutUrl: cart.checkoutUrl };
  } catch (error) {
    const result = fail("buy-now", error);
    return { ok: false, error: result.ok ? "" : result.error };
  }
}

const scheduleInput = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().trim().min(1).max(60) });

/**
 * Saves the pickup or delivery date and time on the order (Shopify admin:
 * Additional details). The choice is checked against the store's rules in its
 * own time zone, so a date past its cut-off can never be saved.
 */
export async function setOrderScheduleAction(input: { date: string; time: string }): Promise<CartResult> {
  const parsed = scheduleInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose a date and a time." };
  const { store } = getSiteConfig();
  const ordering = store.ordering;
  if (!ordering?.scheduling) return { ok: false, error: "Scheduling is not turned on for this store." };
  if (!isAllowedChoice(new Date(), store.locale.timezone, ordering, parsed.data.date, parsed.data.time)) {
    return { ok: false, error: "That date or time is no longer available. Please choose another." };
  }
  return mutate("schedule", (cartId) =>
    getCartSource().updateAttributes(cartId, [
      { key: ordering.dateLabel, value: formatScheduleDate(parsed.data.date, store.locale.language) },
      { key: ordering.timeLabel, value: parsed.data.time },
      { key: SCHEDULE_DATE_KEY, value: parsed.data.date },
    ]),
  );
}
