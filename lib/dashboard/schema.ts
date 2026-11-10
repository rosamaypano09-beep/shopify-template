import { z } from "zod";
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
const background = z.enum(["default", "surface", "primary"]).optional();
const base = { id: z.string().regex(/^[a-z0-9-]{1,60}$/), enabled: z.boolean(), background };
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
    variant: z.enum(["split", "centered"]),
    title: text(160).min(1),
    subtitle: text(400).optional(),
    primaryCta: cta,
    secondaryCta: cta,
    image,
  }),
  z.object({
    ...base,
    type: z.literal("benefits"),
    title: text(120).optional(),
    items: z
      .array(
        z.object({
          icon: z.enum(["truck", "shield", "leaf", "return", "support", "badge", "heart", "clock"]),
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
    limit: z.number().int().min(1).max(12),
    cta,
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
    items: z.array(z.object({ question: text(200).min(1), answer: text(1500).min(1) })).max(20),
    cta,
  }),
  z.object({
    ...base,
    type: z.literal("testimonials"),
    title: text(160).min(1),
    items: z.array(z.object({ quote: text(600).min(1), name: text(80).min(1), detail: text(80).optional() })).max(12),
  }),
  z.object({
    ...base,
    type: z.literal("logoMarquee"),
    title: text(80).optional(),
    animated: z.boolean(),
    items: z
      .array(
        z.object({
          name: text(60).min(1),
          logo: z.union([z.string().regex(/^(\/|https:\/\/)/), z.literal("")]).optional(),
          href: z.union([href, z.literal("")]).optional(),
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
    cta,
  }),
]);

const navItem = z
  .object({ label: text(40).min(1), href, external: z.boolean().optional() })
  .passthrough(); // keeps dropdown groups that are edited in code

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

  "theme.preset": z.string().refine(isPresetId, "Unknown preset"),
  ...Object.fromEntries(colorKeys.map((key) => [`theme.tokens.colors.${key}`, hex])),
  "theme.variants.productCard": z.enum(["minimal", "modern", "editorial", "luxury", "compact", "image-first"]),
  "theme.variants.productImageRatio": z.enum(["square", "portrait", "landscape"]),
  "theme.variants.animation": z.enum(["none", "subtle", "lively"]),
  "theme.variants.footer": z.enum(["surface", "primary"]),

  ...Object.fromEntries(featureKeys.map((key) => [`features.${key}`, z.boolean()])),

  "navigation.announcement.enabled": z.boolean(),
  "navigation.announcement.message": text(160),
  "navigation.header.sticky": z.boolean(),
  "navigation.header.hideOnScroll": z.boolean(),
  "navigation.header.transparent": z.boolean(),
  "navigation.header.showSearch": z.boolean(),
  "navigation.header.showCart": z.boolean(),
  "navigation.header.showWishlist": z.boolean(),
  "navigation.header.showAccount": z.boolean(),
  "navigation.main": z.array(navItem).max(10),

  "seo.titleTemplate": text(80).refine((value) => value.includes("%s"), "Keep %s where the page title goes"),
  "seo.defaultTitle": text(70).min(1),
  "seo.defaultDescription": text(170).min(1),

  "homepage.sections": z
    .array(sectionSchema)
    .max(30)
    .refine((sections) => new Set(sections.map((s) => s.id)).size === sections.length, "Each section needs its own id"),
};

export const COLOR_KEYS = colorKeys;
export const FEATURE_KEYS = featureKeys;
