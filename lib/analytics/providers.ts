import type { AnalyticsEvent, AnalyticsItem, AnalyticsProvider } from "./index";

/* Each provider maps the site's events onto that vendor's standard event names. */

type Fn = (...args: unknown[]) => void;
type TikTok = { track: Fn; page: Fn };
const w = () => window as unknown as { gtag?: Fn; fbq?: Fn; ttq?: TikTok };

const gaItem = (item: AnalyticsItem) => ({
  item_id: item.id,
  item_name: item.name,
  item_variant: item.variant,
  price: item.price,
  quantity: item.quantity,
});

export const ga4: AnalyticsProvider = (event: AnalyticsEvent) => {
  const gtag = w().gtag;
  if (!gtag) return;
  switch (event.name) {
    case "page_view":
      return gtag("event", "page_view", { page_path: event.path, page_title: event.title });
    case "view_item":
    case "add_to_cart":
    case "remove_from_cart":
      return gtag("event", event.name, {
        currency: event.currency,
        value: event.item.price * event.item.quantity,
        items: [gaItem(event.item)],
      });
    case "view_item_list":
      return gtag("event", "view_item_list", { item_list_name: event.listName });
    case "search":
      return gtag("event", "search", { search_term: event.term });
    case "view_cart":
    case "begin_checkout":
      return gtag("event", event.name, { currency: event.currency, value: event.value });
    case "add_to_wishlist":
      return gtag("event", "add_to_wishlist", { items: [{ item_id: event.handle, item_name: event.title }] });
  }
};

export const metaPixel: AnalyticsProvider = (event: AnalyticsEvent) => {
  const fbq = w().fbq;
  if (!fbq) return;
  switch (event.name) {
    case "page_view":
      return fbq("track", "PageView");
    case "view_item":
      return fbq("track", "ViewContent", {
        content_ids: [event.item.id],
        content_name: event.item.name,
        content_type: "product",
        value: event.item.price,
        currency: event.currency,
      });
    case "add_to_cart":
      return fbq("track", "AddToCart", {
        content_ids: [event.item.id],
        content_name: event.item.name,
        content_type: "product",
        value: event.item.price * event.item.quantity,
        currency: event.currency,
      });
    case "search":
      return fbq("track", "Search", { search_string: event.term });
    case "begin_checkout":
      return fbq("track", "InitiateCheckout", { value: event.value, currency: event.currency, num_items: event.itemCount });
    case "add_to_wishlist":
      return fbq("track", "AddToWishlist", { content_ids: [event.handle], content_name: event.title });
  }
};

export const tiktokPixel: AnalyticsProvider = (event: AnalyticsEvent) => {
  const ttq = w().ttq;
  if (!ttq) return;
  switch (event.name) {
    case "page_view":
      return ttq.page();
    case "view_item":
      return ttq.track("ViewContent", {
        contents: [{ content_id: event.item.id, content_name: event.item.name, content_type: "product" }],
        value: event.item.price,
        currency: event.currency,
      });
    case "add_to_cart":
      return ttq.track("AddToCart", {
        contents: [{ content_id: event.item.id, content_name: event.item.name, content_type: "product", quantity: event.item.quantity }],
        value: event.item.price * event.item.quantity,
        currency: event.currency,
      });
    case "search":
      return ttq.track("Search", { query: event.term });
    case "begin_checkout":
      return ttq.track("InitiateCheckout", { value: event.value, currency: event.currency });
    case "add_to_wishlist":
      return ttq.track("AddToWishlist", { contents: [{ content_id: event.handle, content_name: event.title }] });
  }
};
