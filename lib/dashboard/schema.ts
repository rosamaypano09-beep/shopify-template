import { z } from "zod";
import { SECTION_ICON_NAMES, type SectionIconName } from "@/lib/section-icons";
import { isPresetId } from "@/themes";

/**
 * Everything the dashboard is allowed to change, and the shape each value
 * must have. A path that is not listed here cannot be saved.
 */

const text = (max = 200) => z.string().trim().max(max);
const href = z
  .string()
  .trim()
  .max(500)
  .regex(/^(\/|https:\/\/|mailto:|tel:)/, "Links start with / or https://");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour like #1E4D3A");
const cta = z.object({ label: text(60).min(1), href }).optional();
const background = z.enum(["default", "surface", "primary", "secondary", "inverse", "glow"]).optional();
const icon = z.enum(SECTION_ICON_NAMES as [SectionIconName, ...SectionIconName[]]);
const base = {
  id: z.string().regex(/^[a-z0-9-]{1,60}$/),
  enabled: z.boolean(),
  background,
  shape: z.enum(["flat", "curved", "card"]).optional(),
  backdrop: z.enum(["none", "aurora", "orbs", "stars", "gradient", "grid"]).optional(),
  spacing: z.enum(["compact", "normal", "spacious"]).optional(),
  align: z.enum(["left", "center"]).optional(),
  eyebrow: text(80).optional(),
  titleAccent: text(120).optional(),
};
const handle = z.string().regex(/^[a-z0-9][a-z0-9-_]{0,200}$/i);
const image = z
  .object({
    src: z.string().regex(/^(\/|https:\/\/)/),
    mobileSrc: z.string().regex(/^(\/|https:\/\/)/).optional(),
    alt: text(200),
    position: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
  })
  .optional();

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("hero"),
    variant: z.enum(["split", "centered", "spotlight"]),
    title: text(160).min(1),
    subtitle: text(400).optional(),
    primaryCta: cta,
    addToCartHandle: z.union([handle, z.literal("")]).optional(),
    addToCartVariant: text(120).optional(),
    secondaryCta: cta,
    proof: text(200).optional(),
    image,
  }),
  z.object({
    ...base,
    type: z.literal("blogPosts"),
    title: text(160).min(1),
    description: text(400).optional(),
    blogHandle: handle,
    limit: z.number().int().min(1).max(12),
    cta,
    layout: z.enum(["grid", "featured", "list"]).optional(),
    columns: z.enum(["2", "3", "4"]).optional(),
    tag: text(80).optional(),
    showExcerpt: z.boolean().optional(),
    showDate: z.boolean().optional(),
    showAuthor: z.boolean().optional(),
    showTags: z.boolean().optional(),
    readMoreLabel: text(40).optional(),
  }),
  z.object({
    ...base,
    type: z.literal("marquee"),
    items: z.array(z.object({ text: text(60), icon: icon.optional() })).max(16),
    separator: z.enum(["dot", "star", "sparkle", "slash", "diamond", "icon", "none"]),
    font: z.enum(["heading", "body", "playfair", "cormorant", "bricolage", "jost", "schibsted", "figtree"]),
    weight: z.enum(["400", "500", "600", "700", "800", "900"]),
    italic: z.boolean().optional(),
    uppercase: z.boolean().optional(),
    textStyle: z.enum(["solid", "outline", "alternate"]).optional(),
    size: z.enum(["sm", "md", "lg", "xl", "display"]),
    speed: z.enum(["slow", "normal", "fast"]),
    direction: z.enum(["left", "right"]),
    doubleRow: z.boolean().optional(),
    tilt: z.boolean().optional(),
    borders: z.boolean().optional(),
    backgroundColor: hex.optional(),
    textColor: hex.optional(),
    accentColor: hex.optional(),
  }),
  z.object({
    ...base,
    type: z.literal("shopifyPage"),
    pageHandle: handle,
    showTitle: z.boolean(),
    excerptOnly: z.boolean().optional(),
    image,
    imageSide: z.enum(["left", "right"]).optional(),
    cta,
  }),
  z.object({
    ...base,
    type: z.literal("benefits"),
    title: text(120).optional(),
    items: z
      .array(
        z.object({
          icon,
          title: text(80).min(1),
          body: text(240),
        }),
      )
      .max(6),
  }),
  z.object({
    ...base,
    type: z.literal("collectionGrid"),
    title: text(160).min(1),
    description: text(400).optional(),
    handles: z.array(handle).max(12),
  }),
  z.object({
    ...base,
    type: z.literal("featuredProducts"),
    title: text(160).min(1),
    description: text(400).optional(),
    collectionHandle: handle,
    limit: z.number().int().min(1).max(24),
    cta,
    tabs: z.array(z.object({ label: text(40), collectionHandle: z.union([handle, z.literal("")]) })).max(8).optional(),
    allLabel: text(40).optional(),
    columns: z.enum(["2", "3", "4"]).optional(),
    quickAdd: z.boolean().optional(),
    quickAddLabel: text(30).optional(),
  }),
  z.object({
    ...base,
    type: z.literal("brandStatement"),
    text: text(400).min(1),
    attribution: text(120).optional(),
    cta,
  }),
  z.object({ ...base, type: z.literal("newsletter"), title: text(160).min(1), description: text(400).optional() }),
  z.object({
    ...base,
    type: z.literal("faq"),
    title: text(160).min(1),
    layout: z.enum(["stacked", "split"]).optional(),
    description: text(400).optional(),
    items: z.array(z.object({ question: text(200).min(1), answer: text(1500).min(1) })).max(20),
    cta,
  }),
  z.object({
    ...base,
    type: z.literal("testimonials"),
    title: text(160).min(1),
    layout: z.enum(["grid", "featured", "carousel"]).optional(),
    items: z
      .array(
        z.object({
          quote: text(600).min(1),
          name: text(80).min(1),
          detail: text(80).optional(),
          avatar: z.union([z.string().regex(/^(\/|https:\/\/)/), z.literal("")]).optional(),
          rating: z.number().int().min(1).max(5).optional(),
        }),
      )
      .max(12),
  }),
  z.object({
    ...base,
    type: z.literal("logoMarquee"),
    title: text(80).optional(),
    layout: z.enum(["row", "card"]).optional(),
    description: text(300).optional(),
    animated: z.boolean(),
    items: z
      .array(
        z.object({
          name: text(60).min(1),
          logo: z.union([z.string().regex(/^(\/|https:\/\/)/), z.literal("")]).optional(),
          href: z.union([href, z.literal("")]).optional(),
          highlight: z.boolean().optional(),
        }),
      )
      .max(24),
  }),
  z.object({
    ...base,
    type: z.literal("imageText"),
    title: text(160).min(1),
    body: text(1200).min(1),
    image,
    imageSide: z.enum(["left", "right"]),
    imageFit: z.enum(["cover", "contain"]).optional(),
    cards: z.array(z.object({ title: text(80), body: text(240) })).max(4).optional(),
    cta,
  }),
  z.object({
    ...base,
    type: z.literal("highlights"),
    items: z.array(z.object({ text: text(60) })).max(8),
    layout: z.enum(["row", "marquee", "curve"]).optional(),
    curve: z.enum(["wave", "arc", "dip"]).optional(),
    speed: z.enum(["slow", "normal", "fast"]).optional(),
    direction: z.enum(["left", "right"]).optional(),
    size: z.enum(["sm", "md", "lg"]).optional(),
    font: z.enum(["heading", "body", "playfair", "cormorant", "bricolage", "jost", "schibsted", "figtree"]).optional(),
    italic: z.boolean().optional(),
    uppercase: z.boolean().optional(),
    separator: z.enum(["dot", "sparkle", "star", "diamond"]).optional(),
    ribbon: z.enum(["none", "brand", "surface"]).optional(),
    overlap: z.boolean().optional(),
    straightOnPhones: z.boolean().optional(),
  }),
  z.object({
    ...base,
    type: z.literal("featureBand"),
    title: text(160).min(1),
    description: text(400).optional(),
    layout: z.enum(["centered", "split"]).optional(),
    itemStyle: z.enum(["chips", "outline", "solid", "cards", "icons", "list"]).optional(),
    columns: z.enum(["2", "3", "4", "auto"]).optional(),
    iconShape: z.enum(["circle", "square", "plain"]).optional(),
    items: z.array(z.object({ icon, text: text(60), body: text(200).optional() })).max(12),
    stat: z
      .object({
        value: text(20),
        source: z.enum(["manual", "shopifyOrders"]).optional(),
        roundDown: z.enum(["none", "10", "100", "1000"]).optional(),
        baseline: z.number().int().min(0).max(100_000_000).optional(),
        plus: z.boolean().optional(),
        caption: text(30).optional(),
        label: text(60),
        title: text(80).optional(),
        titleAccent: text(80).optional(),
        body: text(200).optional(),
        countUp: z.boolean().optional(),
        countSeconds: z.number().min(0.5).max(15).optional(),
        countEffect: z.enum(["plain", "speedBlur"]).optional(),
        blurStrength: z.number().min(0).max(3).optional(),
        maxBlur: z.number().min(0).max(30).optional(),
        italicNumber: z.boolean().optional(),
      })
      .optional(),
    cta,
  }),
  z.object({
    ...base,
    type: z.literal("productSpotlight"),
    title: text(160).min(1),
    description: text(400).optional(),
    products: z.array(z.object({ handle, label: text(60).optional() })).max(12).optional(),
    productHandle: z.union([handle, z.literal("")]).optional(),
    showFromPrice: z.boolean().optional(),
    buttonLabel: text(60).optional(),
    priceInButton: z.boolean().optional(),
    visual: z.enum(["image", "menu"]).optional(),
    image,
    imageSide: z.enum(["left", "right"]),
    menu: z
      .object({
        title: text(60).optional(),
        items: z.array(z.object({ handle, label: text(40).optional() })).max(24),
        linkLabel: text(20).optional(),
        linkHref: z.union([href, z.literal("")]).optional(),
      })
      .optional(),
    bundle: z.object({ productHandle: handle, size: z.number().int().min(2).max(12), lead: text(60).optional(), linkLabel: text(80).min(1) }).optional(),
    showContact: z.boolean().optional(),
    visualBackground: hex.optional(),
    panelBackground: hex.optional(),
    panelText: hex.optional(),
  }),
]);

const imagePath = z.string().regex(/^(\/|https:\/\/)/, "Images start with / or https://");
const navLink = z.object({ label: text(60).min(1), href, external: z.boolean().optional() });
const navGroup = z.object({ title: text(60), links: z.array(navLink).max(12) });
const navFeature = z.object({
  title: text(80).min(1),
  description: text(240),
  href,
  image: imagePath.optional(),
  ctaLabel: text(40).optional(),
});

/** Drops the half-filled parts a form leaves behind: empty columns, an empty promo tile, blank optional strings. */
function tidyNavItem(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const item = { ...(raw as Record<string, unknown>) };
  const groups = Array.isArray(item.groups)
    ? (item.groups as { title?: string; links?: { label?: string; href?: string }[] }[])
        .map((group) => ({ ...group, links: (group.links ?? []).filter((link) => link.label?.trim() || link.href?.trim()) }))
        .filter((group) => group.links.length)
    : [];
  if (groups.length) item.groups = groups;
  else delete item.groups;
  const feature = item.feature as Record<string, unknown> | undefined;
  if (!feature || !String(feature.title ?? "").trim()) delete item.feature;
  else {
    const next = { ...feature, description: feature.description ?? "", href: feature.href || item.href };
    for (const key of ["image", "ctaLabel"]) if (!String(next[key as keyof typeof next] ?? "").trim()) delete next[key as keyof typeof next];
    item.feature = next;
  }
  return item;
}

const navItem = z.preprocess(
  tidyNavItem,
  navLink.extend({ groups: z.array(navGroup).max(4).optional(), feature: navFeature.optional() }),
);

const colorKeys = [
  "background",
  "surface",
  "text",
  "textMuted",
  "border",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "accent",
  "accentForeground",
] as const;

const featureKeys = [
  "cartDrawer",
  "wishlist",
  "reviews",
  "quickView",
  "recentlyViewed",
  "newsletter",
  "predictiveSearch",
  "customerAccounts",
  "stickyAddToCart",
  "mobileBottomNav",
] as const;

export const editablePaths: Record<string, z.ZodType> = {
  "store.name": text(80).min(1),
  "store.description": text(300),
  "store.contact.email": z.union([z.string().trim().email(), z.literal("")]),
  "store.contact.phone": text(40),
  "store.social.instagram": z.union([href, z.literal("")]),
  "store.social.facebook": z.union([href, z.literal("")]),
  "store.social.tiktok": z.union([href, z.literal("")]),
  "store.social.youtube": z.union([href, z.literal("")]),
  "store.social.pinterest": z.union([href, z.literal("")]),
  "store.social.x": z.union([href, z.literal("")]),
  "store.promotions.freeShippingThreshold": z.number().min(0).max(10_000_000),
  "store.ordering.cartTitle": text(40),
  "store.ordering.cartNote": text(240),
  "store.ordering.scheduling": z.boolean(),
  "store.ordering.dateLabel": text(40).min(1),
  "store.ordering.timeLabel": text(40).min(1),
  "store.ordering.openDays": z.array(z.number().int().min(0).max(6)).max(7),
  "store.ordering.cutoffHour": z.number().int().min(0).max(24),
  "store.ordering.minDaysAhead": z.number().int().min(0).max(60),
  "store.ordering.maxDaysAhead": z.number().int().min(1).max(365),
  "store.ordering.timeSlots": z.array(text(40).min(1)).max(16),
  "store.ordering.closedDates": z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")).max(120),

  "theme.preset": z.string().refine(isPresetId, "Unknown preset"),
  ...Object.fromEntries(colorKeys.map((key) => [`theme.tokens.colors.${key}`, hex])),
  "theme.variants.productCard": z.enum(["minimal", "modern", "editorial", "luxury", "compact", "image-first"]),
  "theme.variants.productImageRatio": z.enum(["square", "portrait", "landscape"]),
  "theme.variants.animation": z.enum(["none", "subtle", "lively"]),
  "theme.variants.footer": z.enum(["surface", "primary"]),

  ...Object.fromEntries(featureKeys.map((key) => [`features.${key}`, z.boolean()])),

  "navigation.announcement.enabled": z.boolean(),
  "navigation.announcement.message": text(160),
  "navigation.announcement.link.label": text(60),
  "navigation.announcement.link.href": z.union([href, z.literal("")]),
  "navigation.header.navAlign": z.enum(["left", "center", "right"]),
  "navigation.header.linkStyle": z.enum(["pill", "underline", "plain"]),
  "navigation.header.uppercaseLinks": z.boolean(),
  "navigation.header.megaMenuViewAll": z.boolean(),
  "navigation.header.sticky": z.boolean(),
  "navigation.header.hideOnScroll": z.boolean(),
  "navigation.header.transparent": z.boolean(),
  "navigation.header.showSearch": z.boolean(),
  "navigation.header.showCart": z.boolean(),
  "navigation.header.showWishlist": z.boolean(),
  "navigation.header.showAccount": z.boolean(),
  "navigation.main": z.array(navItem).max(10),
  "navigation.source": z.enum(["config", "shopify"]),
  "navigation.footerShopifyPages.enabled": z.boolean(),
  "navigation.footerShopifyPages.title": text(40),
  "navigation.shopifyMenuHandle": handle,

  "seo.titleTemplate": text(80).refine((value) => value.includes("%s"), "Keep %s where the page title goes"),
  "seo.defaultTitle": text(70).min(1),
  "seo.organization.name": text(80).min(1),
  "seo.defaultDescription": text(170).min(1),

  "homepage.sections": z
    .array(sectionSchema)
    .max(30)
    .refine((sections) => new Set(sections.map((s) => s.id)).size === sections.length, "Each section needs its own id"),
};

export const COLOR_KEYS = colorKeys;
export const FEATURE_KEYS = featureKeys;
