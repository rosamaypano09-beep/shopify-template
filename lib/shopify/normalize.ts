import type {
  Collection,
  Money,
  Product,
  ProductRating,
  ProductSummary,
  ProductVariant,
  ShopImage,
} from "./types";

/* Raw shapes: exactly what the queries in live.ts select. */

export interface RawImage {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface RawProductSummary {
  id: string;
  handle: string;
  title: string;
  vendor?: string | null;
  availableForSale: boolean;
  tags?: string[] | null;
  featuredImage?: RawImage | null;
  images?: { nodes: RawImage[] } | null;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange?: { minVariantPrice: Money } | null;
  rating?: { value: string } | null;
  ratingCount?: { value: string } | null;
}

export interface RawVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money | null;
  selectedOptions: { name: string; value: string }[];
  image?: RawImage | null;
}

export interface RawProduct extends RawProductSummary {
  description?: string | null;
  productType?: string | null;
  updatedAt: string;
  /** Aliased `images(first: 12)`; the summary fragment already uses `images`. */
  gallery?: { nodes: RawImage[] } | null;
  options?: { name: string; optionValues: { name: string }[] }[] | null;
  variants?: { nodes: RawVariant[] } | null;
  seo?: { title?: string | null; description?: string | null } | null;
}

export interface RawCollection {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  updatedAt: string;
  image?: RawImage | null;
  seo?: { title?: string | null; description?: string | null } | null;
}

export function normalizeImage(image: RawImage | null | undefined): ShopImage | null {
  if (!image?.url) return null;
  return {
    url: image.url,
    altText: image.altText ?? null,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

/** A compare-at price only counts when it is actually higher than the price. */
export function effectiveCompareAt(price: Money, compareAt: Money | null | undefined): Money | null {
  if (!compareAt) return null;
  return Number(compareAt.amount) > Number(price.amount) ? compareAt : null;
}

/**
 * Shopify stores a rating as JSON such as {"value":"4.6","scale_min":"1.0","scale_max":"5.0"}.
 * Returns null unless there is a sensible rating with at least one review.
 */
export function normalizeRating(rating: string | null | undefined, count: string | null | undefined): ProductRating | null {
  if (!rating || !count) return null;
  try {
    const parsed = JSON.parse(rating) as { value?: string; scale_max?: string };
    const max = Number(parsed.scale_max ?? 5);
    const value = (Number(parsed.value) / (max > 0 ? max : 5)) * 5;
    const total = Number.parseInt(count, 10);
    if (!Number.isFinite(value) || value <= 0 || value > 5 || !(total > 0)) return null;
    return { value: Math.round(value * 10) / 10, count: total };
  } catch {
    return null;
  }
}

export function normalizeProductSummary(raw: RawProductSummary): ProductSummary {
  const images = (raw.images?.nodes ?? []).map(normalizeImage).filter((i): i is ShopImage => i !== null);
  const featuredImage = normalizeImage(raw.featuredImage) ?? images[0] ?? null;
  const price = raw.priceRange.minVariantPrice;

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    vendor: raw.vendor ?? "",
    availableForSale: raw.availableForSale,
    tags: raw.tags ?? [],
    featuredImage,
    secondaryImage: images.find((image) => image.url !== featuredImage?.url) ?? null,
    price,
    hasPriceRange: raw.priceRange.minVariantPrice.amount !== raw.priceRange.maxVariantPrice.amount,
    compareAtPrice: effectiveCompareAt(price, raw.compareAtPriceRange?.minVariantPrice),
    rating: normalizeRating(raw.rating?.value, raw.ratingCount?.value),
  };
}

function normalizeVariant(raw: RawVariant): ProductVariant {
  return {
    id: raw.id,
    title: raw.title,
    availableForSale: raw.availableForSale,
    price: raw.price,
    compareAtPrice: effectiveCompareAt(raw.price, raw.compareAtPrice),
    selectedOptions: raw.selectedOptions,
    image: normalizeImage(raw.image),
  };
}

export function normalizeProduct(raw: RawProduct): Product {
  const summary = normalizeProductSummary(raw);
  const images = (raw.gallery?.nodes ?? raw.images?.nodes ?? [])
    .map(normalizeImage)
    .filter((i): i is ShopImage => i !== null);

  return {
    ...summary,
    description: raw.description ?? "",
    productType: raw.productType ?? "",
    images: images.length ? images : summary.featuredImage ? [summary.featuredImage] : [],
    options: (raw.options ?? []).map((option) => ({
      name: option.name,
      values: option.optionValues.map((value) => value.name),
    })),
    variants: (raw.variants?.nodes ?? []).map(normalizeVariant),
    seo: { title: raw.seo?.title ?? null, description: raw.seo?.description ?? null },
    updatedAt: raw.updatedAt,
  };
}

export function normalizeCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description ?? "",
    image: normalizeImage(raw.image),
    seo: { title: raw.seo?.title ?? null, description: raw.seo?.description ?? null },
    updatedAt: raw.updatedAt,
  };
}
