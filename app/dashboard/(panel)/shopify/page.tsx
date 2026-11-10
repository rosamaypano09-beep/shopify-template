import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLoading } from "@/components/dashboard/settings-page";
import { PageHeader } from "@/components/dashboard/shell";
import { assertAdmin } from "@/lib/dashboard/session";
import { getShopifyConnection } from "@/lib/env";

export const metadata: Metadata = { title: "Shopify" };

const GROUPS: { title: string; links: { label: string; path: string; note: string }[] }[] = [
  {
    title: "Catalog",
    links: [
      { label: "Add a product", path: "/products/new", note: "Then tick Headless under Publishing so it appears on the site." },
      { label: "All products", path: "/products", note: "Edit prices, photos, variants and stock." },
      { label: "Add a collection", path: "/collections/new", note: "A collection is a category. Publish it to Headless too." },
      { label: "All collections", path: "/collections", note: "The handle of each one is what menus and homepage sections use." },
    ],
  },
  {
    title: "Promotions",
    links: [
      { label: "Create a discount", path: "/discounts/new", note: "Customers enter the code in the cart. Shopify decides if it applies." },
      { label: "All discounts", path: "/discounts", note: "" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Blog posts", path: "/content/articles", note: "The storefront blog is not built yet; posts will appear once it is." },
      { label: "Files", path: "/content/files", note: "Upload images, then paste their address into a homepage section." },
      { label: "Menus", path: "/content/menus", note: "The site's menus are set in Navigation here, not in Shopify." },
      { label: "Metaobjects", path: "/content/metaobjects", note: "" },
      { label: "Policies", path: "/settings/legal", note: "Privacy, terms, refund and shipping. They appear on the site automatically." },
    ],
  },
  {
    title: "Running the store",
    links: [
      { label: "Orders", path: "/orders", note: "" },
      { label: "Customers", path: "/customers", note: "" },
      { label: "Analytics", path: "/analytics", note: "" },
      { label: "Headless channel", path: "/apps/headless", note: "Access tokens and Storefront API permissions." },
    ],
  },
];

async function Links() {
  await assertAdmin();
  const connection = getShopifyConnection();
  const handle = connection.mode === "live" ? connection.storeDomain.replace(/\.myshopify\.com$/, "") : null;
  const admin = handle ? `https://admin.shopify.com/store/${handle}` : null;

  return (
    <>
      {!admin ? (
        <p className="rounded-lg border border-border bg-background p-5 text-sm">
          No Shopify store is connected, so there is nothing to link to. Add SHOPIFY_STORE_DOMAIN and the access token to
          .env.local and restart.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {GROUPS.map((group) => (
            <section key={group.title} className="rounded-lg border border-border bg-background p-5 sm:p-6">
              <h2 className="text-base font-semibold">{group.title}</h2>
              <ul className="mt-3 divide-y divide-border">
                {group.links.map((link) => (
                  <li key={link.path}>
                    <a
                      href={`${admin}${link.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-12 items-center justify-between gap-4 py-2 text-sm"
                    >
                      <span>
                        <span className="font-medium underline-offset-4 group-hover:underline">{link.label}</span>
                        {link.note ? <span className="block text-xs text-muted">{link.note}</span> : null}
                      </span>
                      <ExternalLink aria-hidden className="size-4 shrink-0 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

export default function ShopifyPage() {
  return (
    <>
      <PageHeader
        title="Shopify"
        description="Products, collections, discounts, orders and customers are stored in Shopify. These links open the right Shopify screen in a new tab; changes show on the site within about a minute."
      />
      <Suspense fallback={<DashboardLoading />}>
        <Links />
      </Suspense>
    </>
  );
}
