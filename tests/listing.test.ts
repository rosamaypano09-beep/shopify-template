import { describe, expect, it } from "vitest";
import {
  activeFilterCount,
  clearFilters,
  filterInputs,
  listingHref,
  PAGE_SIZE,
  parseListingParams,
  toggleFilter,
} from "@/lib/catalog/params";
import {
  defaultVariant,
  findVariant,
  hasRealOptions,
  selectionOf,
  shortVariantId,
  valueState,
  variantFromShortId,
} from "@/lib/catalog/variants";
import { mockProducts } from "@/lib/shopify/mock/catalog";
import { mockSource } from "@/lib/shopify/mock/source";
import type { Product } from "@/lib/shopify/types";

describe("listing URL state", () => {
  it("parses and clamps", () => {
    const state = parseListingParams({ sort: "price-asc", show: "9999", f: ["a", "a", "b"], min: "100", max: "x" }, "featured");
    expect(state).toEqual({ sort: "price-asc", show: 240, filterIds: ["a", "b"], min: 100, max: null });
    expect(parseListingParams({}, "featured")).toEqual({
      sort: "featured",
      show: PAGE_SIZE,
      filterIds: [],
      min: null,
      max: null,
    });
    expect(parseListingParams({ min: "-5", show: "abc" }, "featured").min).toBeNull();
  });

  it("builds clean links and round-trips", () => {
    const state = parseListingParams({}, "featured");
    expect(listingHref("/collections/calm", state, "featured")).toBe("/collections/calm");
    const filtered = toggleFilter({ ...state, sort: "price-desc", show: 48 }, "filter.v.availability.1");
    const href = listingHref("/collections/calm", filtered, "featured");
    expect(href).toBe("/collections/calm?sort=price-desc&f=filter.v.availability.1");
    const reparsed = parseListingParams(Object.fromEntries(new URL(href, "https://x.test").searchParams), "featured");
    expect(reparsed.filterIds).toEqual(["filter.v.availability.1"]);
    expect(activeFilterCount(clearFilters(filtered))).toBe(0);
    expect(toggleFilter(filtered, "filter.v.availability.1").filterIds).toEqual([]);
  });

  it("only sends Shopify inputs that belong to the collection's own filters", async () => {
    const collection = await mockSource.getCollection("best-sellers");
    const state = parseListingParams({ f: ["filter.v.availability.1", "made-up-id"], max: "700" }, "featured");
    expect(filterInputs(state, collection!.filters)).toEqual([
      JSON.stringify({ available: true }),
      JSON.stringify({ price: { max: 700 } }),
    ]);
    expect(filterInputs(state, [])).toEqual([]);
  });
});

describe("demo catalog filters and search", () => {
  it("filters by availability, type and price", async () => {
    const all = await mockSource.getCollection("senior");
    expect(all!.products.length).toBe(2);
    const inStock = await mockSource.getCollection("senior", { filters: [JSON.stringify({ available: true })] });
    expect(inStock!.products.map((p) => p.handle)).toEqual(["hip-joint-chews"]);
    const cheap = await mockSource.getCollection("best-sellers", { filters: [JSON.stringify({ price: { max: 700 } })] });
    expect(cheap!.products.every((p) => Number(p.price.amount) <= 700)).toBe(true);
    const powder = await mockSource.getCollection("digestion", { filters: [JSON.stringify({ productType: "Powder" })] });
    expect(powder!.products.length).toBe(2);
    // Filter list always describes the whole collection, so options never vanish.
    expect(inStock!.filters).toEqual(all!.filters);
  });

  it("searches products, puts sold-out last, and returns nothing for an empty query", async () => {
    const chews = await mockSource.search("chews");
    expect(chews.totalCount).toBeGreaterThan(3);
    const availability = chews.products.map((p) => p.availableForSale);
    expect(availability).toEqual([...availability].sort((a, b) => Number(b) - Number(a)));
    expect((await mockSource.search("   ")).totalCount).toBe(0);
    expect((await mockSource.search("zzzz")).products).toEqual([]);
  });

  it("suggests products and collections while typing", async () => {
    const result = await mockSource.predictiveSearch("sk");
    expect(result.products.some((p) => p.handle === "skin-coat-chews")).toBe(true);
    expect(result.collections.some((c) => c.handle === "skin-coat")).toBe(true);
  });
});

describe("variant selection", () => {
  const calm = mockProducts.find((p) => p.handle === "settle-calming-chews")!;
  const single = mockProducts.find((p) => p.handle === "gut-probiotic-powder")!;

  // Two options, one combination missing and one sold out.
  const shirt: Product = {
    ...calm,
    options: [
      { name: "Color", values: ["Red", "Blue"] },
      { name: "Size", values: ["S", "M"] },
    ],
    variants: [
      { ...calm.variants[0], id: "gid://shopify/ProductVariant/1", selectedOptions: [{ name: "Color", value: "Red" }, { name: "Size", value: "S" }], availableForSale: false },
      { ...calm.variants[0], id: "gid://shopify/ProductVariant/2", selectedOptions: [{ name: "Color", value: "Red" }, { name: "Size", value: "M" }], availableForSale: true },
      { ...calm.variants[0], id: "gid://shopify/ProductVariant/3", selectedOptions: [{ name: "Color", value: "Blue" }, { name: "Size", value: "S" }], availableForSale: true },
    ],
  };

  it("starts on the first variant that can be bought", () => {
    expect(defaultVariant(shirt)?.id).toBe("gid://shopify/ProductVariant/2");
    expect(defaultVariant({ ...shirt, variants: [] })).toBeNull();
  });

  it("finds variants and reports missing combinations", () => {
    expect(findVariant(shirt, { Color: "Blue", Size: "S" })?.id).toBe("gid://shopify/ProductVariant/3");
    expect(findVariant(shirt, { Color: "Blue", Size: "M" })).toBeNull();
  });

  it("labels each option value given the rest of the selection", () => {
    const selection = selectionOf(shirt.variants[1]); // Red / M
    expect(valueState(shirt, selection, "Size", "S")).toBe("sold-out");
    expect(valueState(shirt, selection, "Size", "M")).toBe("available");
    expect(valueState(shirt, selection, "Color", "Blue")).toBe("missing");
  });

  it("round-trips the short id used in share links", () => {
    expect(shortVariantId("gid://shopify/ProductVariant/3")).toBe("3");
    expect(variantFromShortId(shirt, "3")?.id).toBe("gid://shopify/ProductVariant/3");
    expect(variantFromShortId(shirt, "999")).toBeNull();
    expect(variantFromShortId(shirt, null)).toBeNull();
  });

  it("hides the picker for single-variant products", () => {
    expect(hasRealOptions(single)).toBe(false);
    expect(hasRealOptions(calm)).toBe(true);
  });
});
