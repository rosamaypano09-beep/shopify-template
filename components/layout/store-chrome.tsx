import type { CSSProperties, ReactNode } from "react";
import { getSiteConfig } from "@/config";
import { Analytics } from "@/components/analytics/analytics";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteProvider } from "@/components/site-context";
import { getShopifyConnection } from "@/lib/env";
import { AnnouncementBar } from "./announcement-bar";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileBottomNav } from "./mobile-bottom-nav";

/** Everything around a storefront page: providers, announcement bar, header, footer, cart, trackers. */
export function StoreChrome({ children }: { children: ReactNode }) {
  const { store, theme, navigation, features, analytics } = getSiteConfig();
  const bottomNav = features.mobileBottomNav;

  return (
    <SiteProvider
      settings={{
        locale: store.locale.language,
        currency: store.locale.currency,
        features,
        cardStyle: theme.variants.productCard,
        imageRatio: theme.variants.productImageRatio,
        animation: theme.variants.animation,
        checkoutAvailable: getShopifyConnection().mode === "live",
      }}
    >
      <CartProvider
        settings={{
          locale: store.locale.language,
          openDrawerOnAdd: features.cartDrawer,
          freeShippingThreshold: store.promotions.freeShippingThreshold ?? null,
          currency: store.locale.currency,
        }}
      >
        <div
          className="flex min-h-full flex-1 flex-col max-lg:pb-(--ce-bottom-nav-height,0px)"
          style={bottomNav ? ({ "--ce-bottom-nav-height": "3.5rem" } as CSSProperties) : undefined}
        >
          <a
            href="#main"
            className="sr-only z-50 rounded-control bg-foreground px-4 py-3 text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <AnnouncementBar announcement={navigation.announcement} />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          {bottomNav ? (
            <MobileBottomNav wishlist={features.wishlist} search={navigation.header.showSearch} />
          ) : null}
          <CartDrawer />
          <Analytics config={analytics} />
        </div>
      </CartProvider>
    </SiteProvider>
  );
}
