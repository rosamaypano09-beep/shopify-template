import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = { title: "SEO" };

export default function SeoPage() {
  return (
    <SettingsPage
      title="SEO"
      description="How the homepage appears in Google and when shared. Product and collection pages build their own titles from Shopify."
      groups={[
        {
          title: "Search results",
          fields: [
            { kind: "text", key: "seo.defaultTitle", label: "Homepage title", max: 70, hint: "Up to about 60 characters shows in full." },
            { kind: "text", key: "seo.organization.name", label: "Business name for search engines", max: 80, hint: "The name Google can show for your site." },
            { kind: "textarea", key: "seo.defaultDescription", label: "Homepage description", max: 170, hint: "Up to 160 characters." },
            { kind: "text", key: "seo.titleTemplate", label: "Title pattern for other pages", max: 80, hint: "%s is replaced by the page title, for example: %s | Store Name" },
          ],
        },
      ]}
    />
  );
}
