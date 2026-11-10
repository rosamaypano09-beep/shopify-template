"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useHydrated } from "@/lib/use-hydrated";
import { useStoredList, WISHLIST_KEY } from "@/lib/use-stored-list";
import { ClientProductGrid } from "./client-product-grid";
import { ProductGridSkeleton } from "./product-grid";

export function WishlistView() {
  const { items } = useStoredList(WISHLIST_KEY);
  const hydrated = useHydrated();
  if (!hydrated) return <ProductGridSkeleton count={4} />;

  const empty = (
    <EmptyState
      title="Your wishlist is empty"
      description="Tap the heart on any product to save it here."
      action={
        <Button asChild>
          <Link href="/collections">Browse the shop</Link>
        </Button>
      }
    />
  );

  return <ClientProductGrid handles={items} empty={empty} />;
}
