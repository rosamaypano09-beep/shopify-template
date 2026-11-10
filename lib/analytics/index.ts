/**
 * Analytics, behind one function. Components call track({ name: "add_to_cart", ... })
 * and never mention Google, Meta or TikTok. Providers are attached only after
 * the visitor has agreed to tracking (components/analytics/analytics.tsx), so
 * before consent every call here is a no-op.
 *
 * "purchase" is not sent from this site: orders complete on Shopify's checkout.
 * Track purchases with Shopify's own pixels (Settings > Customer events).
 */

export interface AnalyticsItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
}

export type AnalyticsEvent =
  | { name: "page_view"; path: string; title: string }
  | { name: "view_item"; currency: string; item: AnalyticsItem }
  | { name: "view_item_list"; listName: string; count: number }
  | { name: "search"; term: string }
  | { name: "add_to_cart"; currency: string; item: AnalyticsItem }
  | { name: "remove_from_cart"; currency: string; item: AnalyticsItem }
  | { name: "view_cart"; currency: string; value: number; itemCount: number }
  | { name: "begin_checkout"; currency: string; value: number; itemCount: number }
  | { name: "add_to_wishlist"; handle: string; title: string };

export type AnalyticsProvider = (event: AnalyticsEvent) => void;

const providers = new Map<string, AnalyticsProvider>();

export function registerProvider(id: string, provider: AnalyticsProvider) {
  providers.set(id, provider);
}

export function clearProviders() {
  providers.clear();
}

export function track(event: AnalyticsEvent) {
  for (const provider of providers.values()) {
    try {
      provider(event);
    } catch {
      // A broken tracker must never break the shop.
    }
  }
}
