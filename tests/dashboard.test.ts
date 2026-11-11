import { describe, expect, it } from "vitest";
import { editablePaths, sectionSchema } from "@/lib/dashboard/schema";
import { createSessionValue, verifySessionValue } from "@/lib/dashboard/session-core";
import { deepMerge, getPath, setPath } from "@/lib/merge";
import { presets } from "@/themes";
import { themeToCssVars } from "@/themes/css-vars";

const SECRET = "0123456789abcdef0123456789abcdef";

describe("dashboard sign-in cookie", () => {
  it("accepts its own cookie and rejects everything else", () => {
    const value = createSessionValue(SECRET);
    expect(verifySessionValue(value, SECRET)).toBe(true);
    expect(verifySessionValue(value, "a-different-secret-a-different-secret")).toBe(false);
    expect(verifySessionValue(undefined, SECRET)).toBe(false);
    expect(verifySessionValue(value, null)).toBe(false);
    expect(verifySessionValue("garbage", SECRET)).toBe(false);
    expect(verifySessionValue(`${value}.extra`, SECRET)).toBe(false);
  });

  it("cannot be extended by editing the expiry", () => {
    const [expires, signature] = createSessionValue(SECRET).split(".");
    expect(verifySessionValue(`${Number(expires) + 99999}.${signature}`, SECRET)).toBe(false);
  });

  it("expires after twelve hours", () => {
    const value = createSessionValue(SECRET, 0);
    expect(verifySessionValue(value, SECRET, 11 * 3600 * 1000)).toBe(true);
    expect(verifySessionValue(value, SECRET, 13 * 3600 * 1000)).toBe(false);
  });
});

describe("dashboard settings", () => {
  it("only accepts listed settings with valid values", () => {
    expect(editablePaths["theme.tokens.colors.primary"].safeParse("#1E4D3A").success).toBe(true);
    expect(editablePaths["theme.tokens.colors.primary"].safeParse("red").success).toBe(false);
    expect(editablePaths["theme.preset"].safeParse("midnight").success).toBe(true);
    expect(editablePaths["theme.preset"].safeParse("nope").success).toBe(false);
    expect(editablePaths["seo.titleTemplate"].safeParse("No placeholder").success).toBe(false);
    expect(editablePaths["store.url"]).toBeUndefined();
  });

  it("validates the new section types and refuses script-like links", () => {
    const ok = (value: unknown) => sectionSchema.safeParse(value).success;
    expect(ok({ id: "t", type: "testimonials", enabled: true, title: "Reviews", items: [{ quote: "Great", name: "Ana" }] })).toBe(true);
    expect(ok({ id: "l", type: "logoMarquee", enabled: true, animated: true, items: [{ name: "Acme", logo: "", href: "" }] })).toBe(true);
    expect(ok({ id: "i", type: "imageText", enabled: true, title: "T", body: "B", imageSide: "left" })).toBe(true);
    expect(ok({ id: "i", type: "imageText", enabled: true, title: "T", body: "B", imageSide: "left", cta: { label: "Go", href: "javascript:alert(1)" } })).toBe(false);
    expect(ok({ id: "x", type: "unknown", enabled: true })).toBe(false);
  });

  it("merges and edits nested settings without touching the original", () => {
    const base = { a: { b: 1, c: [1, 2] }, d: "x" };
    expect(deepMerge(base, { a: { c: [9] } })).toEqual({ a: { b: 1, c: [9] }, d: "x" });
    expect(base.a.c).toEqual([1, 2]);
    const set = setPath({}, "store.contact.email", "a@b.co");
    expect(getPath(set, "store.contact.email")).toBe("a@b.co");
    expect(setPath(set, "store.contact.email", undefined)).toEqual({});
  });
});

describe("theme presets", () => {
  it("all define the same tokens", () => {
    const keys = Object.keys(themeToCssVars(presets.organic)).sort();
    for (const preset of Object.values(presets)) {
      expect(Object.keys(themeToCssVars(preset)).sort(), preset.id).toEqual(keys);
    }
    expect(Object.keys(presets).length).toBe(9);
  });

  it("keep text readable on its background (contrast 4.5 or higher)", () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => {
        const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const preset of Object.values(presets)) {
      const c = preset.tokens.colors;
      const pairs: [string, string, string][] = [
        ["text on background", c.text, c.background],
        ["muted on background", c.textMuted, c.background],
        ["text on surface", c.text, c.surface],
        ["primary pair", c.primaryForeground, c.primary],
        ["accent pair", c.accentForeground, c.accent],
        ["secondary pair", c.secondaryForeground, c.secondary],
      ];
      for (const [name, fg, bg] of pairs) {
        expect(contrast(fg, bg), `${preset.id}: ${name}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
