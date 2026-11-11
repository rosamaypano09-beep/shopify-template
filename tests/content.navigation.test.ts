import { describe, expect, it } from "vitest";
import { menuToNavItems } from "@/lib/navigation";
import { menuItemHref, normalizeMenu } from "@/lib/shopify/normalize";

const hosts = ["purple-yam.myshopify.com", "purpleyam.ph"];

describe("Shopify menu links", () => {
  it("turns links to the shop's own resources into storefront paths", () => {
    expect(menuItemHref("https://purple-yam.myshopify.com/collections/pies", "COLLECTION", hosts)).toEqual({ href: "/collections/pies", external: false });
    expect(menuItemHref("https://purpleyam.ph/pages/about-us", "PAGE", hosts)).toEqual({ href: "/pages/about-us", external: false });
    expect(menuItemHref("https://other-domain.com/blogs/news", "BLOG", hosts)).toEqual({ href: "/blogs/news", external: false });
    expect(menuItemHref("https://purpleyam.ph/collections/all", "CATALOG", hosts)).toEqual({ href: "/collections", external: false });
  });

  it("keeps custom links to other sites external", () => {
    expect(menuItemHref("https://instagram.com/purpleyam", "HTTP", hosts)).toEqual({ href: "https://instagram.com/purpleyam", external: true });
    expect(menuItemHref("https://purpleyam.ph/search?q=ube", "HTTP", hosts)).toEqual({ href: "/search?q=ube", external: false });
  });
});

describe("menuToNavItems", () => {
  const menu = normalizeMenu(
    [
      { title: "Home", url: "https://purpleyam.ph/", type: "FRONTPAGE" },
      {
        title: "Shop",
        url: "https://purpleyam.ph/collections/all",
        type: "CATALOG",
        items: [
          { title: "Whole pies", url: "https://purpleyam.ph/collections/whole-pie", type: "COLLECTION" },
          {
            title: "Flavours",
            url: "https://purpleyam.ph/collections/all",
            type: "CATALOG",
            items: [{ title: "Ube", url: "https://purpleyam.ph/collections/ube", type: "COLLECTION" }],
          },
        ],
      },
      { title: "  ", url: "https://purpleyam.ph/", type: "FRONTPAGE" },
    ],
    hosts,
  );

  it("drops untitled items and keeps plain links plain", () => {
    const items = menuToNavItems(menu);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: "Home", href: "/", external: undefined });
  });

  it("builds dropdown columns from nested items", () => {
    const shop = menuToNavItems(menu)[1];
    expect(shop.groups?.map((group) => group.title)).toEqual(["Shop", "Flavours"]);
    expect(shop.groups?.[0].links.map((link) => link.href)).toEqual(["/collections/whole-pie"]);
    expect(shop.href).toBe("/collections");
    expect(shop.groups?.[1].links[0]).toMatchObject({ label: "Ube", href: "/collections/ube" });
  });
});

describe("menu saved from the dashboard", () => {
  it("accepts the menu written in config", async () => {
    const { editablePaths } = await import("@/lib/dashboard/schema");
    const { navigationConfig } = await import("@/config/navigation.config");
    const parsed = editablePaths["navigation.main"].safeParse(navigationConfig.main);
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
  });

  it("drops empty dropdown columns, empty links and an untitled promo tile", async () => {
    const { editablePaths } = await import("@/lib/dashboard/schema");
    const parsed = editablePaths["navigation.main"].safeParse([
      {
        label: "Shop",
        href: "/collections",
        groups: [
          { title: "Flavours", links: [{ label: "Ube", href: "/collections/ube" }, { label: "", href: "" }] },
          { title: "Empty", links: [] },
        ],
        feature: { title: "", description: "", href: "", image: "" },
      },
      { label: "Journal", href: "/blogs/news", groups: [], feature: { title: "Read", description: "", href: "", image: "" } },
    ]);
    expect(parsed.success).toBe(true);
    const [shop, journal] = parsed.data as { groups?: { links: unknown[] }[]; feature?: Record<string, string> }[];
    expect(shop.groups).toHaveLength(1);
    expect(shop.groups?.[0].links).toHaveLength(1);
    expect(shop.feature).toBeUndefined();
    expect(journal.groups).toBeUndefined();
    expect(journal.feature).toEqual({ title: "Read", description: "", href: "/blogs/news" });
  });
});
