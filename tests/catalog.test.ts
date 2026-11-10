import { describe, expect, it } from "vitest";
import { mockSource } from "@/lib/shopify/mock/source";

describe("demo catalog source", () => {
  it("returns a product by handle and null for unknown handles", async () => {
    expect((await mockSource.getProduct("wild-salmon-oil"))?.title).toBe("Wild Salmon Oil");
    expect(await mockSource.getProduct("does-not-exist")).toBeNull();
  });

  it("returns a collection with its products, and null for unknown handles", async () => {
    const collection = await mockSource.getCollection("best-sellers");
    expect(collection?.products.length).toBeGreaterThan(0);
    expect(await mockSource.getCollection("does-not-exist")).toBeNull();
  });

  it("paginates with a cursor", async () => {
    const first = await mockSource.getProducts({ first: 4 });
    expect(first.products).toHaveLength(4);
    expect(first.pageInfo.hasNextPage).toBe(true);

    const second = await mockSource.getProducts({ first: 100, after: first.pageInfo.endCursor });
    expect(second.pageInfo.hasNextPage).toBe(false);
    const handles = [...first.products, ...second.products].map((p) => p.handle);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it("sorts by price", async () => {
    const { products } = await mockSource.getProducts({ sort: "price-asc" });
    const prices = products.map((p) => Number(p.price.amount));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("covers the edge cases the UI must handle", async () => {
    const { products } = await mockSource.getProducts({ first: 100 });
    expect(products.some((p) => !p.availableForSale)).toBe(true);
    expect(products.some((p) => p.compareAtPrice)).toBe(true);
    expect(products.some((p) => p.featuredImage === null)).toBe(true);

    const partlySoldOut = await mockSource.getProduct("settle-calming-chews");
    expect(partlySoldOut?.availableForSale).toBe(true);
    expect(partlySoldOut?.variants.some((v) => !v.availableForSale)).toBe(true);
  });
});
