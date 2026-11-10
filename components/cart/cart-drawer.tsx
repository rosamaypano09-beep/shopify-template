"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics";
import { useHydrated } from "@/lib/use-hydrated";
import { CartLineItem, CartTotals, CheckoutButton, FreeShippingBar } from "./cart-contents";
import { useCart } from "./cart-provider";

/** Header cart button with the item count. Opens the drawer. */
export function CartButton() {
  const { cart, openDrawer } = useCart();
  // The header can hydrate after the cart has loaded; start from the server's "empty" either way.
  const hydrated = useHydrated();
  const count = hydrated ? (cart?.totalQuantity ?? 0) : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={count ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      className="relative inline-flex size-11 items-center justify-center rounded-control hover:bg-foreground/8"
    >
      <ShoppingBag aria-hidden className="size-[1.375rem]" strokeWidth={1.75} />
      {count ? (
        <span
          aria-hidden
          className="absolute top-1 right-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] leading-none font-bold text-primary-foreground tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}

export function CartDrawer() {
  const { cart, status, error, isDrawerOpen, openDrawer, closeDrawer } = useCart();
  const hasItems = Boolean(cart?.lines.length);

  useEffect(() => {
    if (!isDrawerOpen || !cart?.lines.length) return;
    track({
      name: "view_cart",
      currency: cart.total.currencyCode,
      value: Number(cart.total.amount),
      itemCount: cart.totalQuantity,
    });
    // Report once per opening, not on every quantity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen]);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <SheetContent title="Your cart" side="right" className="w-[min(28rem,100vw)]">
        {status === "loading" ? (
          <div className="flex flex-col gap-5 p-5" role="status" aria-label="Loading your cart">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : hasItems && cart ? (
          <div className="flex min-h-full flex-col">
            <div className="border-b border-border px-5 py-4">
              <FreeShippingBar cart={cart} />
            </div>
            <ul className="flex-1 divide-y divide-border px-5">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} onNavigate={closeDrawer} />
              ))}
            </ul>
            <div className="sticky bottom-0 flex flex-col gap-4 border-t border-border bg-background p-5">
              {error ? (
                <p role="alert" className="type-small font-medium text-danger">
                  {error}
                </p>
              ) : null}
              <CartTotals cart={cart} />
              <CheckoutButton cart={cart} />
              <Button asChild variant="link" className="min-h-11 self-center">
                <Link href="/cart" onClick={closeDrawer}>
                  View cart and add a discount code
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 p-5 pt-8">
            <p className="type-h3">Your cart is empty</p>
            <p className="text-muted">Items you add will appear here.</p>
            <Button asChild className="mt-2">
              <Link href="/collections" onClick={closeDrawer}>
                Browse the shop
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
