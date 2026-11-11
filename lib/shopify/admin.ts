import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getAdminConnection, type AdminConnection } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * The one place that reads Shopify's Admin API, and only for counts shown as
 * public proof numbers. Never used for anything a visitor can change.
 */

export const ORDERS_COUNT_QUERY = /* GraphQL */ `
  query OrdersCount {
    ordersCount(limit: null) {
      count
      precision
    }
  }
`;

let issued: { token: string; expiresAt: number } | null = null;

/**
 * An Admin API access token. A fixed token is used as it is; client
 * credentials are exchanged for a 24-hour token, kept in memory and renewed a
 * minute before it runs out.
 */
async function adminToken(admin: AdminConnection): Promise<string | null> {
  if (admin.auth.kind === "token") return admin.auth.token;
  if (issued && issued.expiresAt > Date.now() + 60_000) return issued.token;
  const response = await fetch(`https://${admin.storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: admin.auth.clientId, client_secret: admin.auth.clientSecret }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    // 400 with shop_not_permitted: the app and the store are not in the same Shopify organization.
    logger.error("Admin API token request failed", { scope: "shopify", status: response.status, body: (await response.text()).slice(0, 300) });
    return null;
  }
  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) return null;
  issued = { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 86_399) * 1000 };
  return issued.token;
}

/** True when an Admin API token is configured, so order counts can be read. */
export function canCountOrders(): boolean {
  return getAdminConnection() !== null;
}

/**
 * How many orders the store has received, or null when no Admin API token is
 * set or Shopify cannot be reached. Without the read_all_orders scope Shopify
 * counts only the last 60 days. Cached for an hour.
 */
export async function getOrdersCount(): Promise<number | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("orders-count");
  const admin = getAdminConnection();
  if (!admin) return null;
  try {
    const token = await adminToken(admin);
    if (!token) return null;
    const response = await fetch(`https://${admin.storeDomain}/admin/api/${admin.apiVersion}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query: ORDERS_COUNT_QUERY }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      logger.error("Admin API returned an error status", { scope: "shopify", operation: "OrdersCount", status: response.status });
      return null;
    }
    const body = (await response.json()) as { data?: { ordersCount?: { count: number } | null }; errors?: { message: string }[] };
    if (body.errors?.length) {
      logger.error("Admin API returned GraphQL errors", { scope: "shopify", operation: "OrdersCount", messages: body.errors.map((e) => e.message).join("; ") });
      return null;
    }
    return body.data?.ordersCount?.count ?? null;
  } catch (error) {
    logger.error("Admin API request failed", { scope: "shopify", operation: "OrdersCount", error });
    return null;
  }
}

export const ORDER_COUNT_STATUS_QUERY = /* GraphQL */ `
  query OrderCountStatus {
    ordersCount(limit: null) {
      count
    }
    currentAppInstallation {
      accessScopes {
        handle
      }
    }
  }
`;

export type OrderCountStatus =
  | { connected: false; reason: "not-configured" | "unreachable" }
  | { connected: true; count: number; allTime: boolean };

/**
 * For the dashboard: is the order count working, what is it now, and does it
 * cover every order (read_all_orders) or only the last 60 days. Not cached.
 */
export async function getOrderCountStatus(): Promise<OrderCountStatus> {
  const admin = getAdminConnection();
  if (!admin) return { connected: false, reason: "not-configured" };
  try {
    const token = await adminToken(admin);
    if (!token) return { connected: false, reason: "unreachable" };
    const response = await fetch(`https://${admin.storeDomain}/admin/api/${admin.apiVersion}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query: ORDER_COUNT_STATUS_QUERY }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const body = (await response.json()) as {
      data?: { ordersCount?: { count: number } | null; currentAppInstallation?: { accessScopes: { handle: string }[] } | null };
    };
    const count = body.data?.ordersCount?.count;
    if (!response.ok || typeof count !== "number") return { connected: false, reason: "unreachable" };
    const scopes = body.data?.currentAppInstallation?.accessScopes.map((scope) => scope.handle) ?? [];
    return { connected: true, count, allTime: scopes.includes("read_all_orders") };
  } catch (error) {
    logger.error("Order count status failed", { scope: "shopify", error });
    return { connected: false, reason: "unreachable" };
  }
}
