import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { mockSource } from "@/lib/shopify/mock/source";
import { normalizeRating } from "@/lib/shopify/normalize";

describe("sanitizeRichText", () => {
  it("keeps formatting and removes anything executable", () => {
    const dirty =
      '<h1>Refunds</h1><p onclick="steal()">Return within <strong>30 days</strong>.</p>' +
      '<script>alert(1)</script><iframe src="https://evil.test"></iframe>' +
      '<a href="javascript:alert(1)">bad</a><a href="https://example.com">good</a>' +
      '<img src="http://insecure.test/x.png" onerror="x()"><style>p{display:none}</style>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toContain("<h2>Refunds</h2>");
    expect(clean).toContain("<strong>30 days</strong>");
    expect(clean).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">good</a>');
    for (const banned of ["script", "iframe", "onclick", "onerror", "javascript:", "<style", "insecure.test", "alert(1)"]) {
      expect(clean).not.toContain(banned);
    }
  });
});

describe("normalizeRating", () => {
  it("reads Shopify's standard review metafields", () => {
    expect(normalizeRating('{"value":"4.56","scale_min":"1.0","scale_max":"5.0"}', "128")).toEqual({ value: 4.6, count: 128 });
    expect(normalizeRating('{"value":"9","scale_max":"10"}', "3")).toEqual({ value: 4.5, count: 3 });
  });

  it("shows nothing rather than a broken or empty rating", () => {
    expect(normalizeRating(null, "5")).toBeNull();
    expect(normalizeRating('{"value":"4.5"}', null)).toBeNull();
    expect(normalizeRating('{"value":"4.5"}', "0")).toBeNull();
    expect(normalizeRating("not json", "5")).toBeNull();
    expect(normalizeRating('{"value":"7","scale_max":"5"}', "5")).toBeNull();
  });
});

describe("demo catalog extras", () => {
  it("recommends related products, never the product itself", async () => {
    const product = await mockSource.getProduct("hip-joint-chews");
    const related = await mockSource.getRecommendations(product!.id);
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((p) => p.handle === "hip-joint-chews")).toBe(false);
    expect(await mockSource.getRecommendations("gid://mock/Product/unknown")).toEqual([]);
  });

  it("invents no policies and no ratings", async () => {
    expect(await mockSource.getPolicies()).toEqual([]);
    const { products } = await mockSource.getProducts({ first: 100 });
    expect(products.every((p) => p.rating === null)).toBe(true);
  });
});
