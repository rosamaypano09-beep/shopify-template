import "server-only";
import { z } from "zod";

const optional = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const schema = z.object({
  SHOPIFY_STORE_DOMAIN: optional,
  /** Server-only token. Preferred: higher rate limits, never sent to browsers. */
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: optional,
  /** Public Storefront API token. Used when no private token is set. */
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: optional,
  SHOPIFY_API_VERSION: optional,
  SHOPIFY_USE_MOCK: optional,
});

export type ShopifyConnection =
  | { mode: "mock" }
  | {
      mode: "live";
      storeDomain: string;
      privateToken?: string;
      publicToken?: string;
      apiVersion?: string;
    };

export class ConfigError extends Error {
  name = "ConfigError";
}

let cached: ShopifyConnection | undefined;

/**
 * Decides where catalog data comes from.
 *  - Credentials present            -> live Shopify store.
 *  - SHOPIFY_USE_MOCK=true          -> bundled demo catalog (any environment).
 *  - No credentials, in development -> bundled demo catalog.
 *  - No credentials, in production  -> error. A live site never silently sells demo data.
 */
export function getShopifyConnection(): ShopifyConnection {
  if (cached) return cached;
  const env = schema.parse(process.env);

  if (env.SHOPIFY_USE_MOCK === "true") {
    cached = { mode: "mock" };
    return cached;
  }

  const token = env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (env.SHOPIFY_STORE_DOMAIN && token) {
    cached = {
      mode: "live",
      storeDomain: env.SHOPIFY_STORE_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      privateToken: env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
      publicToken: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      apiVersion: env.SHOPIFY_API_VERSION,
    };
    return cached;
  }

  if (process.env.NODE_ENV !== "production") {
    cached = { mode: "mock" };
    return cached;
  }

  throw new ConfigError(
    "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN " +
      "(or SHOPIFY_STOREFRONT_ACCESS_TOKEN), or set SHOPIFY_USE_MOCK=true to run the demo catalog.",
  );
}

/**
 * Where customers sign in. Shopify hosts the account pages (login, orders,
 * addresses, profile), so this site only needs to link to them.
 * Set SHOPIFY_ACCOUNT_URL if the store uses its own account domain,
 * otherwise SHOPIFY_SHOP_ID (the number in Shopify admin's URL settings).
 */
export function getAccountUrl(): string | null {
  const custom = process.env.SHOPIFY_ACCOUNT_URL?.trim();
  if (custom && /^https:\/\//.test(custom)) return custom;
  const shopId = process.env.SHOPIFY_SHOP_ID?.trim();
  if (shopId && /^\d+$/.test(shopId)) return `https://shopify.com/${shopId}/account`;
  return null;
}
