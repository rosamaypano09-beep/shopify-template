import { ShopifyError } from "../errors";
import type { Cart, CartLine, CartLineInput, CartSource, Money } from "../types";
import { mockProducts } from "./catalog";

/**
 * Demo cart. It keeps no server memory: the whole cart is encoded in its own
 * id (which the app stores in a cookie), so it works on serverless hosting
 * exactly like the real one. It has no checkout and accepts no discount codes.
 */

const PREFIX = "mock-cart:";
const MAX_QUANTITY = 99;

interface State {
  /** v: variant id, q: quantity, a: line attributes. */
  lines: { v: string; q: number; a?: { key: string; value: string }[] }[];
  codes: string[];
  /** Order notes. */
  at?: { key: string; value: string }[];
}

const encode = (state: State) => PREFIX + Buffer.from(JSON.stringify(state)).toString("base64url");

function decode(cartId: string): State | null {
  if (!cartId.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cartId.slice(PREFIX.length), "base64url").toString("utf8")) as State;
    if (!Array.isArray(parsed.lines)) return null;
    return {
      lines: parsed.lines,
      codes: Array.isArray(parsed.codes) ? parsed.codes : [],
      // Only carts that have notes carry the key, so older cart ids stay identical.
      ...(Array.isArray(parsed.at) && parsed.at.length ? { at: parsed.at } : {}),
    };
  } catch {
    return null;
  }
}

function findVariant(variantId: string) {
  for (const product of mockProducts) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

const money = (amount: number, currencyCode: string): Money => ({ amount: amount.toFixed(2), currencyCode });

function build(state: State): Cart {
  const lines: CartLine[] = [];
  for (const entry of state.lines) {
    const found = findVariant(entry.v);
    if (!found) continue;
    const { product, variant } = found;
    lines.push({
      // One line per variant and set of notes, like Shopify.
      id: lineId(entry),
      quantity: entry.q,
      merchandiseId: variant.id,
      productHandle: product.handle,
      productTitle: product.title,
      variantTitle: product.variants.length > 1 ? variant.title : "",
      image: variant.image ?? product.featuredImage,
      unitPrice: variant.price,
      compareAtUnitPrice: variant.compareAtPrice,
      totalPrice: money(Number(variant.price.amount) * entry.q, variant.price.currencyCode),
      availableForSale: variant.availableForSale,
      attributes: entry.a ?? [],
    });
  }
  const currency = lines[0]?.unitPrice.currencyCode ?? mockProducts[0].price.currencyCode;
  const subtotal = lines.reduce((sum, line) => sum + Number(line.totalPrice.amount), 0);

  return {
    id: encode(state),
    checkoutUrl: null,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines,
    subtotal: money(subtotal, currency),
    total: money(subtotal, currency),
    discountCodes: state.codes.map((code) => ({ code, applicable: false })),
    attributes: state.at ?? [],
  };
}

function requireState(cartId: string): State {
  const state = decode(cartId);
  if (!state) throw new ShopifyError("This cart no longer exists.", "user");
  return state;
}

const attributeKey = (attributes: { key: string; value: string }[] | undefined) => JSON.stringify(attributes ?? []);
const lineId = (entry: State["lines"][number]) => (entry.a?.length ? `${entry.v}#${Buffer.from(attributeKey(entry.a)).toString("base64url")}` : entry.v);

function add(state: State, lines: CartLineInput[]): State {
  const next = { ...state, lines: state.lines.map((line) => ({ ...line })) };
  for (const line of lines) {
    const found = findVariant(line.merchandiseId);
    if (!found) throw new ShopifyError("This product is no longer available.", "user");
    if (!found.variant.availableForSale) throw new ShopifyError(`${found.product.title} is sold out.`, "user");
    const existing = next.lines.find((entry) => entry.v === line.merchandiseId && attributeKey(entry.a) === attributeKey(line.attributes));
    if (existing) existing.q = Math.min(MAX_QUANTITY, existing.q + line.quantity);
    else next.lines.push({ v: line.merchandiseId, q: Math.min(MAX_QUANTITY, line.quantity), ...(line.attributes?.length ? { a: line.attributes } : {}) });
  }
  return next;
}

export const mockCartSource: CartSource = {
  async getCart(cartId) {
    const state = decode(cartId);
    return state ? build(state) : null;
  },

  async createCart(lines) {
    return build(add({ lines: [], codes: [] }, lines));
  },

  async addLines(cartId, lines) {
    return build(add(requireState(cartId), lines));
  },

  async updateLines(cartId, updates) {
    const state = requireState(cartId);
    const lines = state.lines
      .map((line) => {
        const update = updates.find((u) => u.id === lineId(line));
        return update ? { ...line, q: Math.min(MAX_QUANTITY, update.quantity) } : line;
      })
      .filter((line) => line.q > 0);
    return build({ ...state, lines });
  },

  async removeLines(cartId, lineIds) {
    const state = requireState(cartId);
    return build({ ...state, lines: state.lines.filter((line) => !lineIds.includes(lineId(line))) });
  },

  async updateDiscountCodes(cartId, codes) {
    return build({ ...requireState(cartId), codes: codes.slice(0, 5) });
  },

  async updateAttributes(cartId, attributes) {
    const state = { ...requireState(cartId) };
    delete state.at;
    return build(attributes.length ? { ...state, at: attributes.slice(0, 10) } : state);
  },
};
