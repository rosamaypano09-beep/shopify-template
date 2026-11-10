import { describe, expect, it } from "vitest";
import { normalizeCart } from "@/lib/shopify/cart-live";
import { mockCartSource as cart } from "@/lib/shopify/mock/cart";
import { mockProducts } from "@/lib/shopify/mock/catalog";

const product = (handle: string) => {
  const found = mockProducts.find((p) => p.handle === handle);
  if (!found) throw new Error(`missing ${handle}`);
  return found;
};
const multi = product("everyday-multivitamin-chews");
const oil = product("wild-salmon-oil");
const calm = product("settle-calming-chews");

describe("demo cart", () => {
  it("creates a cart with correct totals", async () => {
    const created = await cart.createCart([{ merchandiseId: multi.variants[0].id, quantity: 2 }]);
    expect(created.totalQuantity).toBe(2);
    expect(created.lines).toHaveLength(1);
    expect(created.lines[0].totalPrice.amount).toBe("1298.00");
    expect(created.subtotal).toEqual({ amount: "1298.00", currencyCode: "PHP" });
    expect(created.checkoutUrl).toBeNull();
  });

  it("merges the same variant into one line and keeps different variants apart", async () => {
    let current = await cart.createCart([{ merchandiseId: multi.variants[0].id, quantity: 1 }]);
    current = await cart.addLines(current.id, [{ merchandiseId: multi.variants[0].id, quantity: 2 }]);
    current = await cart.addLines(current.id, [{ merchandiseId: oil.variants[0].id, quantity: 1 }]);
    expect(current.lines.map((line) => line.quantity)).toEqual([3, 1]);
    expect(current.totalQuantity).toBe(4);
    expect(current.lines[1].compareAtUnitPrice?.amount).toBe("699.00");
  });

  it("survives a round trip through its id, as it does through the cookie", async () => {
    const created = await cart.createCart([{ merchandiseId: oil.variants[1].id, quantity: 1 }]);
    const reread = await cart.getCart(created.id);
    expect(reread).toEqual(created);
  });

  it("updates quantity, and removes the line at zero", async () => {
    let current = await cart.createCart([{ merchandiseId: multi.variants[0].id, quantity: 1 }]);
    const lineId = current.lines[0].id;
    current = await cart.updateLines(current.id, [{ id: lineId, quantity: 5 }]);
    expect(current.lines[0].quantity).toBe(5);
    current = await cart.updateLines(current.id, [{ id: lineId, quantity: 0 }]);
    expect(current.lines).toHaveLength(0);
    expect(current.totalQuantity).toBe(0);
  });

  it("removes a line", async () => {
    let current = await cart.createCart([
      { merchandiseId: multi.variants[0].id, quantity: 1 },
      { merchandiseId: oil.variants[0].id, quantity: 1 },
    ]);
    current = await cart.removeLines(current.id, [current.lines[0].id]);
    expect(current.lines.map((line) => line.productHandle)).toEqual(["wild-salmon-oil"]);
  });

  it("refuses sold-out variants and unknown products", async () => {
    const soldOut = calm.variants.find((variant) => !variant.availableForSale);
    await expect(cart.createCart([{ merchandiseId: soldOut!.id, quantity: 1 }])).rejects.toThrow(/sold out/);
    await expect(cart.createCart([{ merchandiseId: "gid://mock/ProductVariant/nope", quantity: 1 }])).rejects.toThrow();
  });

  it("caps quantity at 99", async () => {
    let current = await cart.createCart([{ merchandiseId: multi.variants[0].id, quantity: 99 }]);
    current = await cart.addLines(current.id, [{ merchandiseId: multi.variants[0].id, quantity: 5 }]);
    expect(current.lines[0].quantity).toBe(99);
  });

  it("returns null for an id it cannot read", async () => {
    expect(await cart.getCart("gid://shopify/Cart/unknown")).toBeNull();
    expect(await cart.getCart("mock-cart:not-base64-json")).toBeNull();
  });

  it("never pretends a discount code applies", async () => {
    let current = await cart.createCart([{ merchandiseId: multi.variants[0].id, quantity: 1 }]);
    current = await cart.updateDiscountCodes(current.id, ["WELCOME10"]);
    expect(current.discountCodes).toEqual([{ code: "WELCOME10", applicable: false }]);
    expect(current.total).toEqual(current.subtotal);
  });
});

describe("normalizeCart (live Shopify shape)", () => {
  const php = (amount: string) => ({ amount, currencyCode: "PHP" });
  const raw = {
    id: "gid://shopify/Cart/abc",
    checkoutUrl: "https://store.myshopify.com/cart/c/abc",
    totalQuantity: 3,
    cost: { subtotalAmount: php("1797.0"), totalAmount: php("1617.3") },
    discountCodes: [{ code: "TEN", applicable: true }],
    lines: {
      nodes: [
        {
          id: "line-1",
          quantity: 3,
          cost: { totalAmount: php("1797.0"), amountPerQuantity: php("599.0"), compareAtAmountPerQuantity: php("699.0") },
          merchandise: {
            id: "gid://shopify/ProductVariant/1",
            title: "Default Title",
            availableForSale: true,
            image: null,
            product: { handle: "wild-salmon-oil", title: "Wild Salmon Oil" },
          },
        },
        // A line whose product was deleted in Shopify.
        { id: "line-2", quantity: 1, cost: { totalAmount: php("0"), amountPerQuantity: php("0") }, merchandise: {} },
      ],
    },
  };

  it("flattens lines, hides 'Default Title' and drops lines with no product", () => {
    const normalized = normalizeCart(raw);
    expect(normalized.lines).toHaveLength(1);
    expect(normalized.lines[0].variantTitle).toBe("");
    expect(normalized.lines[0].compareAtUnitPrice).toEqual(php("699.0"));
    expect(normalized.checkoutUrl).toBe("https://store.myshopify.com/cart/c/abc");
    expect(normalized.total.amount).toBe("1617.3");
  });
});
