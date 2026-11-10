import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = { title: "Navigation" };

const toggle = (key: string, label: string, hint?: string) => ({ kind: "toggle" as const, key: `navigation.header.${key}`, label, hint });

export default function NavigationPage() {
  return (
    <SettingsPage
      title="Navigation"
      description="The announcement bar, the header and the top menu. Dropdown columns and the footer menu are edited in config/navigation.config.ts."
      groups={[
        {
          title: "Announcement bar",
          fields: [
            { kind: "toggle", key: "navigation.announcement.enabled", label: "Show the announcement bar" },
            { kind: "text", key: "navigation.announcement.message", label: "Message", max: 160, hint: "Only promise what the store really offers." },
          ],
        },
        {
          title: "Top menu",
          description: "Links to collections use their Shopify handle: /collections/handle. Items that have a dropdown keep it.",
          fields: [
            {
              kind: "items",
              key: "navigation.main",
              label: "Menu item",
              addLabel: "Add menu item",
              blank: { label: "", href: "/collections" },
              fields: [
                { kind: "text", key: "label", label: "Label", max: 40 },
                { kind: "text", key: "href", label: "Link" },
              ],
            },
          ],
        },
        {
          title: "Header",
          columns: true,
          fields: [
            toggle("sticky", "Stay at the top while scrolling"),
            toggle("hideOnScroll", "Hide when scrolling down"),
            toggle("transparent", "Transparent over the homepage hero"),
            toggle("showSearch", "Show search"),
            toggle("showCart", "Show cart"),
            toggle("showWishlist", "Show wishlist", "Also needs the Wishlist feature."),
            toggle("showAccount", "Show account", "Also needs Customer accounts and SHOPIFY_SHOP_ID."),
          ],
        },
      ]}
    />
  );
}
