import "server-only";
import { createStorefrontClient } from "@shopify/hydrogen-react";
import type { CountryCode, LanguageCode } from "@shopify/hydrogen-react/storefront-api-types";
import { getSiteConfig } from "@/config";
import { getShopifyConnection } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ShopifyError } from "./errors";

const TIMEOUT_MS = 10_000;

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/** Buyer context sent with every query so prices and translations match the store's market. */
export function getBuyerContext(): { country: CountryCode; language: LanguageCode } {
  const { locale } = getSiteConfig().store;
  return {
    country: locale.country.toUpperCase() as CountryCode,
    language: locale.language.split("-")[0].toUpperCase() as LanguageCode,
  };
}

/**
 * The one place that talks to the Storefront API. Everything else in
 * lib/shopify builds on this, and no component calls it directly.
 */
export async function storefrontQuery<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  const connection = getShopifyConnection();
  if (connection.mode !== "live") {
    throw new Error("storefrontQuery was called while the demo catalog is active.");
  }

  const client = createStorefrontClient({
    storeDomain: connection.storeDomain,
    privateStorefrontToken: connection.privateToken,
    publicStorefrontToken: connection.publicToken,
    storefrontApiVersion: connection.apiVersion,
  });
  const headers = connection.privateToken ? client.getPrivateTokenHeaders() : client.getPublicTokenHeaders();
  const operation = /(?:query|mutation)\s+(\w+)/.exec(query)?.[1] ?? "anonymous";

  let response: Response;
  try {
    response = await fetch(client.getStorefrontApiUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    logger.error("Storefront API request failed", { scope: "shopify", operation, error });
    throw new ShopifyError(
      timedOut ? "Shopify took too long to respond." : "Could not reach Shopify.",
      timedOut ? "timeout" : "network",
    );
  }

  if (!response.ok) {
    logger.error("Storefront API returned an error status", {
      scope: "shopify",
      operation,
      status: response.status,
    });
    throw new ShopifyError(`Shopify responded with status ${response.status}.`, "http", response.status);
  }

  const body = (await response.json()) as GraphQLResponse<TData>;
  if (body.errors?.length || !body.data) {
    const messages = body.errors?.map((e) => e.message).join("; ") ?? "Empty response";
    logger.error("Storefront API returned GraphQL errors", { scope: "shopify", operation, messages });
    throw new ShopifyError(messages, "graphql");
  }

  return body.data;
}
