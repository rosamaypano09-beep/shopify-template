"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/site-context";
import { getProductSummariesAction } from "@/lib/catalog/actions";
import type { ProductSummary } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { ProductCardView } from "./product-card-view";
import { ProductGridSkeleton } from "./product-grid";

const grid = "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4";

/**
 * A product grid for lists that only the browser knows (wishlist, recently
 * viewed). Looks products up by handle; ones that no longer exist drop out.
 */
export function ClientProductGrid({
  handles,
  empty,
  className,
}: {
  handles: readonly string[];
  /** Shown when none of the handles resolve to a product. */
  empty?: React.ReactNode;
  className?: string;
}) {
  const site = useSite();
  const key = handles.join(",");
  const [loaded, setLoaded] = useState<{ key: string; products: ProductSummary[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    getProductSummariesAction(key.split(","))
      .then((products) => !cancelled && setLoaded({ key, products }))
      .catch(() => !cancelled && setLoaded({ key, products: [] }));
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key) return <>{empty}</>;
  // Keep showing the previous list while a changed one loads.
  if (!loaded) return <ProductGridSkeleton count={Math.min(4, handles.length)} className={className} />;
  const products = loaded.products.filter((product) => handles.includes(product.handle));
  if (!products.length) return <>{empty}</>;

  return (
    <ul className={cn(grid, className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCardView
            product={product}
            look={{
              cardStyle: site.cardStyle,
              imageRatio: site.imageRatio,
              animation: site.animation,
              locale: site.locale,
              wishlist: site.features.wishlist,
              quickView: site.features.quickView,
              reviews: site.features.reviews,
            }}
          />
        </li>
      ))}
    </ul>
  );
}
