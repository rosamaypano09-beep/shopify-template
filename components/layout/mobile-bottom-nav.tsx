"use client";

import { Heart, Home, Search, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const item = "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium";

/** Optional app-style bar for phones (features.mobileBottomNav). Hidden from 1024px up. */
export function MobileBottomNav({ wishlist, search }: { wishlist: boolean; search: boolean }) {
  const pathname = usePathname();
  const { cart, openDrawer } = useCart();
  const count = useHydrated() ? (cart?.totalQuantity ?? 0) : 0;
  const links = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/collections", label: "Shop", icon: Store, active: pathname.startsWith("/collections") || pathname.startsWith("/products") },
    ...(search ? [{ href: "/search", label: "Search", icon: Search, active: pathname.startsWith("/search") }] : []),
    ...(wishlist ? [{ href: "/wishlist", label: "Wishlist", icon: Heart, active: pathname.startsWith("/wishlist") }] : []),
  ];

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-30 flex h-(--ce-bottom-nav-height) border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {links.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(item, active ? "text-foreground" : "text-muted")}
        >
          <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
          {label}
        </Link>
      ))}
      <button type="button" onClick={openDrawer} className={cn(item, "text-muted")}>
        <span className="relative">
          <ShoppingBag aria-hidden className="size-5" strokeWidth={1.75} />
          {count ? (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-bold text-primary-foreground"
            >
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </span>
        Cart<span className="sr-only">{count ? `, ${count} ${count === 1 ? "item" : "items"}` : ", empty"}</span>
      </button>
    </nav>
  );
}
