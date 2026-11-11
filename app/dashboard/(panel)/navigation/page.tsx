import type { Metadata } from "next";
import type { Field } from "@/components/dashboard/fields";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = { title: "Navigation" };

const toggle = (key: string, label: string, hint?: string) => ({ kind: "toggle" as const, key: `navigation.header.${key}`, label, hint });

const linkFields: Field[] = [
  { kind: "text", key: "label", label: "Text", max: 60 },
  { kind: "link", key: "href", label: "Link", fillLabel: "label" },
];

/** One top-menu item: a link, or a dropdown with up to four columns and a promo tile. */
const menuItemFields: Field[] = [
  { kind: "text", key: "label", label: "Menu text", max: 60 },
  { kind: "link", key: "href", label: "Link", hint: "Where the item goes. For a dropdown, used for its View all link.", fillLabel: "label" },
  {
    kind: "items",
    key: "groups",
    label: "Dropdown column",
    addLabel: "Add dropdown column",
    hint: "Add a column to turn this item into a dropdown. Remove every column to make it a plain link again.",
    collapsible: true,
    summaryKey: "title",
    max: 4,
    blank: { title: "", links: [{ label: "", href: "" }] },
    fields: [
      { kind: "text", key: "title", label: "Column heading", hint: "For example: Shop by flavour", max: 60 },
      {
        kind: "items",
        key: "links",
        label: "Link",
        addLabel: "Add link",
        max: 12,
        blank: { label: "", href: "" },
        fields: linkFields,
      },
    ],
  },
  { kind: "text", key: "feature.title", label: "Promo tile title", hint: "Optional. Shown beside the dropdown columns. Leave empty for no tile.", max: 80 },
  { kind: "link", key: "feature.href", label: "Promo tile link" },
  { kind: "textarea", key: "feature.description", label: "Promo tile text", max: 240 },
  { kind: "text", key: "feature.ctaLabel", label: "Promo tile button text", hint: "For example: Shop now", max: 40 },
  { kind: "image", key: "feature.image", label: "Promo tile image", hint: "A landscape photo works best." },
];

export default function NavigationPage() {
  return (
    <SettingsPage
      title="Navigation"
      description="The announcement bar, the header and the top menu with its dropdowns. Links suggest your Shopify collections, pages, blogs and products as you type. The footer menu is edited in config/navigation.config.ts."
      groups={[
        {
          title: "Announcement bar",
          columns: true,
          fields: [
            { kind: "toggle", key: "navigation.announcement.enabled", label: "Show the announcement bar" },
            { kind: "text", key: "navigation.announcement.message", label: "Message", max: 160, hint: "Only promise what the store really offers." },
            { kind: "text", key: "navigation.announcement.link.label", label: "Link text", max: 60, hint: "Leave empty for no link." },
            { kind: "link", key: "navigation.announcement.link.href", label: "Link" },
          ],
        },
        {
          title: "Menu source",
          description:
            "Edit the menu here, or let the header follow a menu from Shopify admin (Online Store > Navigation). If the Shopify menu is empty or cannot be read, the menu below is shown.",
          columns: true,
          fields: [
            {
              kind: "select",
              key: "navigation.source",
              label: "Top menu comes from",
              options: [
                { value: "config", label: "This dashboard (the menu below)" },
                { value: "shopify", label: "A Shopify menu, live" },
              ],
            },
            { kind: "text", key: "navigation.shopifyMenuHandle", label: "Shopify menu handle", hint: "Shopify's header menu is main-menu." },
          ],
        },
        {
          title: "Top menu",
          description:
            "Open an item to edit it. Add dropdown columns to make a mega menu, with an optional promo tile and image. Use Import from Shopify menu to start from your Shopify menu, then change it freely.",
          fields: [
            {
              kind: "items",
              key: "navigation.main",
              label: "Menu item",
              addLabel: "Add menu item",
              collapsible: true,
              summaryKey: "label",
              importShopifyMenu: true,
              max: 10,
              blank: { label: "", href: "" },
              fields: menuItemFields,
            },
          ],
        },
        {
          title: "Shopify pages in the footer",
          description:
            "Every page you write in Shopify (Online Store > Pages) is published at /pages/handle. Turn this on to list them all in a footer column, so new pages appear without editing any menu. To put one in the top menu instead, add a menu item and pick it from the suggestions.",
          columns: true,
          fields: [
            { kind: "toggle", key: "navigation.footerShopifyPages.enabled", label: "List Shopify pages in the footer" },
            { kind: "text", key: "navigation.footerShopifyPages.title", label: "Column title", hint: "For example: Our story", max: 40 },
          ],
        },
        {
          title: "Menu style",
          columns: true,
          fields: [
            {
              kind: "select",
              key: "navigation.header.navAlign",
              label: "Menu position",
              options: [
                { value: "center", label: "Centered" },
                { value: "left", label: "Next to the logo" },
                { value: "right", label: "Next to the icons" },
              ],
            },
            {
              kind: "select",
              key: "navigation.header.linkStyle",
              label: "Link style",
              options: [
                { value: "pill", label: "Soft pill on hover" },
                { value: "underline", label: "Underline in the brand colour" },
                { value: "plain", label: "Plain text" },
              ],
            },
            toggle("uppercaseLinks", "Uppercase menu text"),
            toggle("megaMenuViewAll", "Add a View all link to each dropdown"),
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
