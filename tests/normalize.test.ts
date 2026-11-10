import { describe, expect, it } from "vitest";
import {
  effectiveCompareAt,
  normalizeCollection,
  normalizeProduct,
  normalizeProductSummary,
  type RawProduct,
} from "@/lib/shopify/normalize";

const money = (amount: string) => ({ amount, currencyCode: "PHP" });

const raw: RawProduct = {
  id: "gid://shopify/Product/1",
  handle: "hip-joint-chews",
  title: "Hip and Joint Chews",
  vendor: "Bantay Daily",
  availableForSale: true,
  tags: ["best-seller"],
  featuredImage: { url: "https://cdn.shopify.com/a.jpg", altText: null, width: 800, height: 800 },
  images: { nodes: [{ url: "https://cdn.shopify.com/a.jpg" }, { url: "https://cdn.shopify.com/b.jpg" }] },
  gallery: { nodes: [{ url: "https://cdn.shopify.com/a.jpg" }, { url: "https://cdn.shopify.com/b.jpg" }] },
  priceRange: { minVariantPrice: money("799.0"), maxVariantPrice: money("1399.0") },
  compareAtPriceRange: { minVariantPrice: money("0.0") },
  description: "Glucosamine chews.",
  productType: "Soft chews",
  updatedAt: "2026-11-01T00:00:00Z",
  options: [{ name: "Size", optionValues: [{ name: "60 chews" }, { name: "120 chews" }] }],
  variants: {
    nodes: [
      {
        id: "v1",
        title: "60 chews",
        availableForSale: true,
        price: money("799.0"),
        compareAtPrice: null,
        selectedOptions: [{ name: "Size", value: "60 chews" }],
      },
      {
        id: "v2",
        title: "120 chews",
        availableForSale: false,
        price: money("1399.0"),
        compareAtPrice: money("1599.0"),
        selectedOptions: [{ name: "Size", value: "120 chews" }],
      },
    ],
  },
  seo: { title: null, description: null },
};

describe("normalizeProductSummary", () => {
  it("flattens price, images and range", () => {
    const summary = normalizeProductSummary(raw);
    expect(summary.price).toEqual(money("799.0"));
    expect(summary.hasPriceRange).toBe(true);
    expect(summary.featuredImage?.url).toBe("https://cdn.shopify.com/a.jpg");
    expect(summary.secondaryImage?.url).toBe("https://cdn.shopify.com/b.jpg");
  });

  it("ignores Shopify's zero compare-at price", () => {
    expect(normalizeProductSummary(raw).compareAtPrice).toBeNull();
  });

  it("survives a product with no images, vendor or tags", () => {
    const summary = normalizeProductSummary({
      ...raw,
      featuredImage: null,
      images: null,
      vendor: null,
      tags: null,
    });
    expect(summary.featuredImage).toBeNull();
    expect(summary.secondaryImage).toBeNull();
    expect(summary.vendor).toBe("");
    expect(summary.tags).toEqual([]);
  });
});

describe("normalizeProduct", () => {
  it("maps options and variants", () => {
    const product = normalizeProduct(raw);
    expect(product.options).toEqual([{ name: "Size", values: ["60 chews", "120 chews"] }]);
    expect(product.variants).toHaveLength(2);
    expect(product.variants[1].availableForSale).toBe(false);
    expect(product.variants[1].compareAtPrice).toEqual(money("1599.0"));
    expect(product.images).toHaveLength(2);
  });

  it("survives missing description, options and variants", () => {
    const product = normalizeProduct({ ...raw, description: null, options: null, variants: null, gallery: null });
    expect(product.description).toBe("");
    expect(product.options).toEqual([]);
    expect(product.variants).toEqual([]);
  });
});

describe("effectiveCompareAt", () => {
  it("only counts a compare-at price that is higher than the price", () => {
    expect(effectiveCompareAt(money("599"), money("699"))).toEqual(money("699"));
    expect(effectiveCompareAt(money("599"), money("599"))).toBeNull();
    expect(effectiveCompareAt(money("599"), money("499"))).toBeNull();
    expect(effectiveCompareAt(money("599"), null)).toBeNull();
  });
});

describe("normalizeCollection", () => {
  it("fills gaps in sparse collections", () => {
    const collection = normalizeCollection({
      id: "c1",
      handle: "calm",
      title: "Calm",
      updatedAt: "2026-11-01T00:00:00Z",
    });
    expect(collection.description).toBe("");
    expect(collection.image).toBeNull();
    expect(collection.seo).toEqual({ title: null, description: null });
  });
});
