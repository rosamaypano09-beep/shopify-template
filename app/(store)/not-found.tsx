import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/**
 * notFound() from a store page (a missing product, collection, Shopify page or
 * blog post). Rendered inside the (store) layout, which already provides the
 * announcement bar, header and footer.
 */
export default function StoreNotFound() {
  return <NotFoundContent />;
}
