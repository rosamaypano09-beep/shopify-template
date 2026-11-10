import "server-only";
import { getSiteConfig } from "@/config";
import { getShopifyConnection } from "@/lib/env";
import { getCollections, getProducts } from "@/lib/shopify";
import { assertAdmin } from "./session";

export interface HealthIssue {
  level: "problem" | "warning";
  area: "Catalog" | "Homepage" | "Navigation" | "SEO" | "Store";
  message: string;
  /** Where to fix it. */
  fix: string;
}

export interface StoreHealth {
  connection: "live" | "demo" | "error";
  storeDomain: string | null;
  productCount: number;
  productCountCapped: boolean;
  collectionCount: number;
  issues: HealthIssue[];
}

/** Checks the things that most often go wrong when setting up a client. */
export async function getStoreHealth(): Promise<StoreHealth> {
  await assertAdmin();
  const config = getSiteConfig();
  const connection = getShopifyConnection();
  const issues: HealthIssue[] = [];
  const health: StoreHealth = {
    connection: connection.mode === "live" ? "live" : "demo",
    storeDomain: connection.mode === "live" ? connection.storeDomain : null,
    productCount: 0,
    productCountCapped: false,
    collectionCount: 0,
    issues,
  };

  let handles = new Set<string>();
  try {
    const [{ products, pageInfo }, collections] = await Promise.all([getProducts({ first: 250 }), getCollections(250)]);
    health.productCount = products.length;
    health.productCountCapped = pageInfo.hasNextPage;
    health.collectionCount = collections.length;
    handles = new Set(collections.map((collection) => collection.handle));

    const noImage = products.filter((product) => !product.featuredImage);
    if (noImage.length) {
      issues.push({
        level: "warning",
        area: "Catalog",
        message: `${noImage.length} ${noImage.length === 1 ? "product has" : "products have"} no photo: ${noImage.slice(0, 3).map((p) => p.title).join(", ")}${noImage.length > 3 ? "…" : ""}`,
        fix: "Add photos to these products in Shopify.",
      });
    }
    if (!products.length) {
      issues.push({
        level: "problem",
        area: "Catalog",
        message: "No products are visible to the site.",
        fix: "Publish products to the Headless sales channel in Shopify.",
      });
    }
  } catch {
    health.connection = "error";
    issues.push({
      level: "problem",
      area: "Store",
      message: "Shopify could not be reached with the current settings.",
      fix: "Check SHOPIFY_STORE_DOMAIN and the access token in .env.local, then restart.",
    });
    return health;
  }

  const collectionHandle = (link: string) => /^\/collections\/([^/?#]+)/.exec(link)?.[1];
  const checkLink = (label: string, link: string, area: HealthIssue["area"]) => {
    const target = collectionHandle(link);
    if (target && !handles.has(target)) {
      issues.push({
        level: "problem",
        area,
        message: `"${label}" links to the collection "${target}", which does not exist in the store.`,
        fix: area === "Navigation" ? "Fix the link in Navigation, or create the collection in Shopify." : "Fix the handle in Homepage.",
      });
    }
  };

  for (const item of config.navigation.main) {
    checkLink(item.label, item.href, "Navigation");
    for (const group of item.groups ?? []) for (const link of group.links) checkLink(link.label, link.href, "Navigation");
  }
  for (const group of config.navigation.footer) for (const link of group.links) checkLink(link.label, link.href, "Navigation");

  for (const section of config.homepage.sections) {
    if (!section.enabled) continue;
    if (section.type === "featuredProducts" && !handles.has(section.collectionHandle)) {
      issues.push({
        level: "problem",
        area: "Homepage",
        message: `Section "${section.title}" uses the collection "${section.collectionHandle}", which does not exist. The section is hidden.`,
        fix: "Change the collection handle in Homepage.",
      });
    }
    if (section.type === "collectionGrid") {
      const missing = section.handles.filter((value) => !handles.has(value));
      if (missing.length) {
        issues.push({
          level: "warning",
          area: "Homepage",
          message: `Section "${section.title}" lists collections that do not exist: ${missing.join(", ")}.`,
          fix: "Remove or correct them in Homepage.",
        });
      }
    }
    if (section.type === "hero" && !section.image) {
      issues.push({ level: "warning", area: "Homepage", message: "The hero has no image.", fix: "Add an image in Homepage." });
    }
  }

  if (config.seo.defaultDescription.length > 160) {
    issues.push({ level: "warning", area: "SEO", message: "The default description is longer than 160 characters and will be cut off in search results.", fix: "Shorten it in SEO." });
  }
  if (!config.seo.defaultSocialImage) {
    issues.push({ level: "warning", area: "SEO", message: "No social sharing image is set.", fix: "Set defaultSocialImage in config/seo.config.ts." });
  }
  if (/localhost/.test(config.store.url)) {
    issues.push({ level: "warning", area: "SEO", message: "The site URL is still localhost.", fix: "Set NEXT_PUBLIC_SITE_URL to the live domain before launch." });
  }
  if (config.store.contact.email?.endsWith("@example.com")) {
    issues.push({ level: "warning", area: "Store", message: "The contact email is still a placeholder.", fix: "Change it in Store details." });
  }
  if (!config.navigation.policies.length && connection.mode !== "live") {
    issues.push({ level: "warning", area: "Store", message: "No policy pages yet. They appear automatically once written in Shopify (Settings > Policies).", fix: "Ask the client to add their policies in Shopify." });
  }

  return health;
}
