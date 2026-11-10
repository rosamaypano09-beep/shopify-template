import { Heart, Search, ShoppingBag, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getSiteConfig, type NavLink } from "@/config";
import { CartButton } from "@/components/cart/cart-drawer";
import { SearchDialog } from "@/components/search/search-dialog";
import { getAccountUrl } from "@/lib/env";
import { DesktopNav } from "./desktop-nav";
import { HeaderShell } from "./header-shell";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

interface Action extends NavLink {
  icon: LucideIcon;
  /** Cart and search have their own interactive buttons instead of a plain link. */
  kind?: "cart" | "search";
  /** Hidden on small screens, where the same link lives in the menu drawer. */
  desktopOnly?: boolean;
}

/** Header actions, decided by navigation.header and the feature switches together. */
function getActions(): Action[] {
  const { navigation, features } = getSiteConfig();
  const { header } = navigation;
  const actions: Action[] = [];

  if (header.showSearch) {
    actions.push({
      label: "Search",
      href: "/search",
      icon: Search,
      kind: features.predictiveSearch ? "search" : undefined,
    });
  }
  if (header.showAccount && features.customerAccounts && getAccountUrl()) {
    actions.push({ label: "Account", href: "/account", icon: User, desktopOnly: true });
  }
  if (header.showWishlist && features.wishlist) {
    actions.push({ label: "Wishlist", href: "/wishlist", icon: Heart, desktopOnly: true });
  }
  if (header.showCart) actions.push({ label: "Cart", href: "/cart", icon: ShoppingBag, kind: "cart" });

  return actions;
}

function HeaderContent() {
  const { store, navigation } = getSiteConfig();
  const actions = getActions();

  return (
    <div className="container-site grid h-(--ce-header-height) grid-cols-[1fr_auto_1fr] items-center gap-3 lg:grid-cols-[auto_1fr_auto] lg:gap-8">
      <MobileMenu
        className="lg:hidden"
        items={navigation.mobile ?? navigation.main}
        utilityLinks={actions.filter((a) => a.desktopOnly).map(({ label, href }) => ({ label, href }))}
      />

      {store.brand.mobileLogo ? (
        <>
          <Logo logo={store.brand.mobileLogo} storeName={store.name} className="justify-self-center lg:hidden" />
          <Logo logo={store.brand.logo} storeName={store.name} className="max-lg:hidden" />
        </>
      ) : (
        <Logo logo={store.brand.logo} storeName={store.name} className="max-lg:justify-self-center" />
      )}

      <DesktopNav items={navigation.main} className="max-lg:hidden" />

      <ul className="flex items-center justify-end gap-1">
        {actions.map(({ label, href, icon: Icon, desktopOnly, kind }) => (
          <li key={href} className={desktopOnly ? "max-lg:hidden" : undefined}>
            {kind === "cart" ? (
              <CartButton />
            ) : kind === "search" ? (
              <SearchDialog locale={store.locale.language} />
            ) : (
              <Link
                href={href}
                aria-label={label}
                className="inline-flex size-11 items-center justify-center rounded-control hover:bg-foreground/8"
              >
                <Icon aria-hidden className="size-[1.375rem]" strokeWidth={1.75} />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Header() {
  const { header } = getSiteConfig().navigation;

  return (
    <HeaderShell sticky={header.sticky} hideOnScroll={header.hideOnScroll} transparent={header.transparent}>
      <HeaderContent />
    </HeaderShell>
  );
}
