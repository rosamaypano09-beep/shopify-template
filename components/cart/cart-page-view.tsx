"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/use-hydrated";
import { CartLineItem, CartNote, CartSchedule, CartTotals, CheckoutButton, DiscountCodes, FreeShippingBar } from "./cart-contents";
import { useCart } from "./cart-provider";

export function CartPageView() {
  const { cart, status, error } = useCart();
  const hydrated = useHydrated();

  if (!hydrated || status === "loading") {
    return (
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]" role="status" aria-label="Loading your cart">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!cart?.lines.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Items you add will appear here."
        action={
          <Button asChild>
            <Link href="/collections">Browse the shop</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
      <ul className="divide-y divide-border border-y border-border">
        {cart.lines.map((line) => (
          <CartLineItem key={line.id} line={line} />
        ))}
      </ul>

      <aside
        aria-label="Order summary"
        className="flex flex-col gap-6 rounded-lg bg-surface p-6 lg:sticky lg:top-[calc(var(--ce-header-height)+2rem)]"
      >
        <FreeShippingBar cart={cart} />
        <DiscountCodes cart={cart} />
        {error ? (
          <p role="alert" className="type-small font-medium text-danger">
            {error}
          </p>
        ) : null}
        <CartSchedule cart={cart} />
        <CartTotals cart={cart} />
        <CartNote />
        <CheckoutButton cart={cart} />
      </aside>
    </div>
  );
}
