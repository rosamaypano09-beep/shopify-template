import type { Metadata } from "next";
import { getSiteConfig } from "@/config";
import type { Product } from "@/lib/shopify";
import { absoluteUrl } from "@/lib/utils";

interface PageSeo {
  /** Without the brand suffix; the title template adds it. */
  title: string;
  description?: string | null;
  /** Path of the page, e.g. "/products/handle". Becomes the canonical URL. */
  path: string;
  image?: string | null;
}

const clip = (text: string, max = 160) =>
  text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;

/** Per-page metadata. Site-wide defaults live in app/layout.tsx. */
export function pageMetadata({ title, description, path, image }: PageSeo): Metadata {
  const { seo, store } = getSiteConfig();
  const summary = clip(description?.trim() || seo.defaultDescription);
  const socialImage = image ?? seo.defaultSocialImage;

  return {
    title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: summary,
      url: path,
      siteName: store.name,
      type: "website",
      ...(socialImage ? { images: [{ url: socialImage }] } : {}),
    },
    twitter: { card: socialImage ? "summary_large_image" : "summary", title, description: summary },
  };
}

export function organizationJsonLd() {
  const { seo, store } = getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo.organization.name,
    url: store.url,
    ...(seo.organization.logo ? { logo: absoluteUrl(seo.organization.logo, store.url) } : {}),
    ...(store.contact.email ? { email: store.contact.email } : {}),
    sameAs: Object.values(store.social).filter(Boolean),
  };
}

export function websiteJsonLd() {
  const { store } = getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: store.name,
    url: store.url,
  };
}

export function breadcrumbJsonLd(items: { label: string; href: string }[]) {
  const { store } = getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href, store.url),
    })),
  };
}

export function productJsonLd(product: Product) {
  const { store } = getSiteConfig();
  const url = absoluteUrl(`/products/${product.handle}`, store.url);
  const prices = product.variants.map((variant) => Number(variant.price.amount));
  const availability = product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const currency = product.price.currencyCode;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: product.images.map((image) => absoluteUrl(image.url, store.url)),
    url,
    ...(product.vendor ? { brand: { "@type": "Brand", name: product.vendor } } : {}),
    offers:
      prices.length > 1 && Math.min(...prices) !== Math.max(...prices)
        ? {
            "@type": "AggregateOffer",
            priceCurrency: currency,
            lowPrice: Math.min(...prices).toFixed(2),
            highPrice: Math.max(...prices).toFixed(2),
            offerCount: prices.length,
            availability,
            url,
          }
        : {
            "@type": "Offer",
            priceCurrency: currency,
            price: Number(product.price.amount).toFixed(2),
            availability,
            url,
          },
  };
}
