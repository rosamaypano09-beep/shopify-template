import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = { title: "Features" };

const feature = (key: string, label: string, hint: string) => ({ kind: "toggle" as const, key: `features.${key}`, label, hint });

export default function FeaturesPage() {
  return (
    <SettingsPage
      title="Features"
      description="Switch off anything this client does not need. A feature that is off shows nothing on the site."
      groups={[
        {
          title: "Shopping",
          fields: [
            feature("cartDrawer", "Open the cart after adding", "When off, only the cart count changes."),
            feature("quickView", "Quick view", "Add to cart from a product list without opening the product."),
            feature("stickyAddToCart", "Sticky add to cart on phones", "Keeps the button in reach on long product pages."),
            feature("predictiveSearch", "Search suggestions while typing", "When off, search opens the results page."),
          ],
        },
        {
          title: "Browsing",
          fields: [
            feature("wishlist", "Wishlist", "Saved in the customer's browser. No account needed."),
            feature("recentlyViewed", "Recently viewed", "Shown under the product page."),
            feature("reviews", "Star ratings", "Shows ratings from the store's review app, when it publishes them."),
            feature("mobileBottomNav", "Bottom bar on phones", "Home, Shop, Search, Wishlist and Cart along the bottom."),
          ],
        },
        {
          title: "Customers",
          fields: [
            feature("customerAccounts", "Customer accounts", "Links to Shopify's account pages. Needs SHOPIFY_SHOP_ID."),
            feature("newsletter", "Newsletter sign-up", "Needs NEWSLETTER_WEBHOOK_URL on the live site."),
          ],
        },
      ]}
    />
  );
}
