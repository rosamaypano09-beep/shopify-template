import { describe, expect, it } from "vitest";
import { homepageConfig } from "@/config/homepage.config";
import { navigationConfig } from "@/config/navigation.config";
import { discountPercent, formatMoney } from "@/lib/format";
import { absoluteUrl, isExternalUrl } from "@/lib/utils";
import { presets, resolveTheme } from "@/themes";
import { themeToCssVars } from "@/themes/css-vars";

describe("formatMoney", () => {
  it("uses the currency from the data, not a hardcoded symbol", () => {
    expect(formatMoney({ amount: "1149.00", currencyCode: "PHP" }, "en-PH")).toBe("₱1,149");
    expect(formatMoney({ amount: "19.50", currencyCode: "USD" }, "en-US")).toBe("$19.50");
    expect(formatMoney({ amount: "1200", currencyCode: "JPY" }, "ja-JP")).toContain("1,200");
  });
});

describe("discountPercent", () => {
  it("returns a whole percentage only for real discounts", () => {
    const php = (amount: string) => ({ amount, currencyCode: "PHP" });
    expect(discountPercent(php("599"), php("699"))).toBe(14);
    expect(discountPercent(php("599"), null)).toBeNull();
    expect(discountPercent(php("599"), php("599"))).toBeNull();
  });
});

describe("url helpers", () => {
  it("detects external links", () => {
    expect(isExternalUrl("https://instagram.com/x")).toBe(true);
    expect(isExternalUrl("mailto:hello@example.com")).toBe(true);
    expect(isExternalUrl("/collections/calm")).toBe(false);
  });

  it("builds absolute URLs", () => {
    expect(absoluteUrl("/products/a", "https://shop.example/")).toBe("https://shop.example/products/a");
    expect(absoluteUrl("https://cdn.shopify.com/a.jpg", "https://shop.example")).toBe("https://cdn.shopify.com/a.jpg");
  });
});

describe("themes", () => {
  it("applies client overrides on top of a preset without mutating it", () => {
    const theme = resolveTheme("organic", { tokens: { colors: { primary: "#0B5FFF" } } });
    expect(theme.tokens.colors.primary).toBe("#0B5FFF");
    expect(theme.tokens.colors.accent).toBe(presets.organic.tokens.colors.accent);
    expect(presets.organic.tokens.colors.primary).not.toBe("#0B5FFF");
  });

  it("emits the same set of CSS variables for every preset", () => {
    const keys = (id: keyof typeof presets) => Object.keys(themeToCssVars(presets[id])).sort();
    expect(keys("luxury")).toEqual(keys("organic"));
    expect(keys("minimal")).toEqual(keys("organic"));
    expect(themeToCssVars(presets.organic)["--ce-color-text-muted"]).toBe(presets.organic.tokens.colors.textMuted);
  });
});

describe("client config", () => {
  it("gives every homepage section a unique id", () => {
    const ids = homepageConfig.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no empty navigation links", () => {
    const links = [
      ...navigationConfig.main,
      ...navigationConfig.main.flatMap((item) => item.groups?.flatMap((group) => group.links) ?? []),
      ...navigationConfig.footer.flatMap((group) => group.links),
      ...navigationConfig.policies,
    ];
    for (const link of links) {
      expect(link.label.trim()).not.toBe("");
      expect(link.href.trim()).not.toBe("");
    }
  });
});
