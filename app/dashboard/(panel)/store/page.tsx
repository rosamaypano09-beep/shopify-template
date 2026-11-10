import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = { title: "Store details" };

const social = (key: string, label: string) => ({
  kind: "text" as const,
  key: `store.social.${key}`,
  label,
  hint: "Full link starting with https://. Leave empty to hide.",
});

export default function StorePage() {
  return (
    <SettingsPage
      title="Store details"
      description="Shown in the header, footer, contact page and search results. Leave a field empty and it is not shown."
      groups={[
        {
          title: "Identity",
          fields: [
            { kind: "text", key: "store.name", label: "Store name", max: 80 },
            { kind: "textarea", key: "store.description", label: "One-sentence description", max: 300, hint: "Shown in the footer." },
          ],
        },
        {
          title: "Contact",
          columns: true,
          fields: [
            { kind: "email", key: "store.contact.email", label: "Email" },
            { kind: "text", key: "store.contact.phone", label: "Phone" },
          ],
        },
        {
          title: "Social media",
          columns: true,
          fields: [social("instagram", "Instagram"), social("facebook", "Facebook"), social("tiktok", "TikTok"), social("youtube", "YouTube"), social("pinterest", "Pinterest"), social("x", "X")],
        },
        {
          title: "Promotions",
          description: "Only shows a progress bar in the cart. The real shipping price is always Shopify's, so this must match a free-shipping rate set there.",
          fields: [{ kind: "number", key: "store.promotions.freeShippingThreshold", label: "Free shipping from (order amount)", hint: "Set to 0 to hide the progress bar." }],
        },
      ]}
    />
  );
}
