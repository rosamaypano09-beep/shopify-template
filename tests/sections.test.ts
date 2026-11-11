import { describe, expect, it } from "vitest";
import savedSettings from "@/config/site.json";
import { homepageConfig } from "@/config/homepage.config";
import { editablePaths, sectionSchema } from "@/lib/dashboard/schema";
import { quickAddVariant } from "@/lib/shopify/normalize";

describe("homepage sections", () => {
  it("accepts every new section type and the look options", () => {
    const examples = [
      { id: "a", type: "highlights", enabled: true, items: [{ text: "Baked daily" }], background: "surface", spacing: "compact" },
      { id: "b", type: "featureBand", enabled: true, title: "T", titleAccent: "A", items: [{ icon: "gift", text: "Gifts" }], stat: { value: "12", label: "Years" }, background: "glow", shape: "curved", align: "center" },
      { id: "c", type: "productSpotlight", enabled: true, title: "Pick", productHandle: "whole-pie", imageSide: "left", background: "inverse", shape: "card" },
      { id: "d", type: "featuredProducts", enabled: true, title: "Fresh", collectionHandle: "best-sellers", limit: 8, columns: "3", quickAdd: true, tabs: [{ label: "Mini", collectionHandle: "mini-pies" }] },
      { id: "e", type: "faq", enabled: true, title: "Q", layout: "split", items: [{ question: "Q?", answer: "A." }] },
      { id: "f", type: "logoMarquee", enabled: true, layout: "card", animated: false, items: [{ name: "Press" }] },
      { id: "g", type: "imageText", enabled: true, title: "Story", body: "Text", imageSide: "left", imageFit: "contain", cards: [{ title: "One", body: "" }], eyebrow: "Since 2009" },
    ];
    for (const example of examples) {
      const parsed = sectionSchema.safeParse(example);
      expect(parsed.success, `${example.type}: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    }
  });

  it("rejects unknown look values", () => {
    expect(sectionSchema.safeParse({ id: "a", type: "highlights", enabled: true, items: [], background: "neon" }).success).toBe(false);
  });

  it("keeps the saved and default homepages valid", () => {
    const schema = editablePaths["homepage.sections"];
    expect(schema.safeParse(homepageConfig.sections).success).toBe(true);
    const saved = (savedSettings as { homepage?: { sections?: unknown } }).homepage?.sections;
    if (saved) {
      const parsed = schema.safeParse(saved);
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    }
  });
});

describe("quick add from a product card", () => {
  it("is offered only for a single variant that is for sale", () => {
    expect(quickAddVariant([{ id: "v1", availableForSale: true }])).toBe("v1");
    expect(quickAddVariant([{ id: "v1", availableForSale: false }])).toBeNull();
    expect(quickAddVariant([{ id: "v1", availableForSale: true }, { id: "v2", availableForSale: true }])).toBeNull();
    expect(quickAddVariant([])).toBeNull();
  });
});

describe("blog post excerpts", () => {
  it("uses the Excerpt written in Shopify, or the start of the post when it is empty", async () => {
    const { normalizeArticle, normalizeArticleSummary } = await import("@/lib/shopify/normalize");
    const raw = { id: "a", handle: "ube", title: "Ube", publishedAt: "2026-11-11T00:00:00Z", excerpt: "", contentPreview: "There was a   time\nwhen…" };
    expect(normalizeArticleSummary(raw).excerpt).toBe("There was a time when…");
    expect(normalizeArticleSummary({ ...raw, excerpt: "Written by hand" }).excerpt).toBe("Written by hand");
    // The article page shows only what was written, so the first paragraph is never repeated.
    expect(normalizeArticle({ ...raw, contentHtml: "<p>x</p>" }).standfirst).toBe("");
  });
});

describe("proof numbers", () => {
  it("reads the number out of what was typed", async () => {
    const { parseStatValue } = await import("@/lib/format");
    expect(parseStatValue("2,000+")).toEqual({ prefix: "", number: 2000, decimals: 0, suffix: "+" });
    expect(parseStatValue("₱1.5M")).toEqual({ prefix: "₱", number: 1.5, decimals: 1, suffix: "M" });
    expect(parseStatValue("4.9/5")?.number).toBe(4.9);
    expect(parseStatValue("Since forever")).toBeNull();
  });

  it("rounds a real order count down, never up", async () => {
    const { statFromCount } = await import("@/lib/format");
    expect(statFromCount(2347, "100", "en")).toBe("2,300+");
    expect(statFromCount(2347, "1000", "en")).toBe("2,000+");
    expect(statFromCount(2300, "100", "en")).toBe("2,300");
    expect(statFromCount(2347, "none", "en")).toBe("2,347");
  });
});

describe("feature band and marquee settings", () => {
  it("accepts the new styles, icons, backdrops and colours", () => {
    const band = {
      id: "band", type: "featureBand", enabled: true, title: "T", backdrop: "aurora", itemStyle: "cards", columns: "auto", iconShape: "square", layout: "split",
      items: [{ icon: "croissant", text: "Flaky crust", body: "Hand-made" }],
      stat: { value: "2,000+", source: "shopifyOrders", roundDown: "100", caption: "orders", label: "and growing", countUp: true, countSeconds: 4 },
    };
    const marquee = {
      id: "m", type: "marquee", enabled: true, items: [{ text: "Ube", icon: "sparkles" }], separator: "icon", font: "cormorant", weight: "700",
      size: "display", speed: "slow", direction: "right", doubleRow: true, tilt: true, backgroundColor: "#1C1220", textColor: "#F7F0F8",
    };
    for (const section of [band, marquee]) {
      const parsed = sectionSchema.safeParse(section);
      expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    }
    expect(sectionSchema.safeParse({ ...marquee, textColor: "pink" }).success).toBe(false);
    expect(sectionSchema.safeParse({ ...band, items: [{ icon: "not-an-icon", text: "x" }] }).success).toBe(false);
  });
});

describe("order count with earlier orders", () => {
  it("adds the Shopify count to the earlier orders and can always show +", async () => {
    const { statFromCount } = await import("@/lib/format");
    expect(statFromCount(2000 + 0, "none", "en", true)).toBe("2,000+");
    expect(statFromCount(2000 + 37, "none", "en", true)).toBe("2,037+");
    expect(statFromCount(2000 + 37, "none", "en")).toBe("2,037");
    expect(statFromCount(2000 + 37, "10", "en")).toBe("2,030+");
  });
});

describe("testimonial avatars", () => {
  it("uses the first letters of the first name and surname, at most two", async () => {
    const { nameInitials } = await import("@/components/sections/testimonials");
    expect(nameInitials("Maria Santos")).toBe("MS");
    expect(nameInitials("Maria Clara dela Cruz")).toBe("MC");
    expect(nameInitials("bea")).toBe("B");
    expect(nameInitials("  Ñino  Ábalos ")).toBe("ÑÁ");
    expect(nameInitials("")).toBe("");
  });
});
