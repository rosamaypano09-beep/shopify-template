"use client";

import { useEffect } from "react";
import { useSite } from "@/components/site-context";
import { RECENTLY_VIEWED_KEY, useStoredList } from "@/lib/use-stored-list";
import { ClientProductGrid } from "./client-product-grid";

/** Records a product view in the visitor's browser. Renders nothing. */
export function TrackProductView({ handle }: { handle: string }) {
  const { features } = useSite();
  const { add } = useStoredList(RECENTLY_VIEWED_KEY, 12);
  useEffect(() => {
    if (features.recentlyViewed) add(handle);
  }, [features.recentlyViewed, add, handle]);
  return null;
}

/** "Recently viewed" row. Hidden until the visitor has looked at another product. */
export function RecentlyViewed({ excludeHandle, title = "Recently viewed" }: { excludeHandle?: string; title?: string }) {
  const { features } = useSite();
  const { items } = useStoredList(RECENTLY_VIEWED_KEY, 12);
  const handles = items.filter((handle) => handle !== excludeHandle).slice(0, 4);
  if (!features.recentlyViewed || !handles.length) return null;

  return (
    <section aria-labelledby="recently-viewed" className="container-site py-section">
      <h2 id="recently-viewed" className="type-h2 mb-8 sm:mb-12">
        {title}
      </h2>
      <ClientProductGrid handles={handles} />
    </section>
  );
}
