import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config";
import { logger } from "@/lib/logger";
import { getCollections, getProducts } from "@/lib/shopify";
import type { ProductSummary } from "@/lib/shopify";

const MAX_PRODUCT_PAGES = 20;

async function getAllProducts(): Promise<ProductSummary[]> {
  const all: ProductSummary[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PRODUCT_PAGES; page++) {
    const { products, pageInfo } = await getProducts({ first: 250, after });
    all.push(...products);
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { store, pages } = getSiteConfig();
  const base = store.url;
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/collections`, changeFrequency: "daily", priority: 0.8 },
  ];

  for (const [path, enabled] of [
    ["/about", pages.about.enabled],
    ["/faq", pages.faq.enabled],
    ["/contact", pages.contact.enabled],
  ] as const) {
    if (enabled) entries.push({ url: `${base}${path}`, changeFrequency: "monthly", priority: 0.4 });
  }

  try {
    const [collections, products] = await Promise.all([getCollections(250), getAllProducts()]);
    for (const collection of collections) {
      entries.push({
        url: `${base}/collections/${collection.handle}`,
        lastModified: collection.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
    for (const product of products) {
      entries.push({ url: `${base}/products/${product.handle}`, changeFrequency: "daily", priority: 0.6 });
    }
  } catch (error) {
    // Serve the static entries rather than failing the whole sitemap.
    logger.error("Sitemap could not load the catalog", { scope: "seo", error });
  }

  return entries;
}
