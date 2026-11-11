import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLoading } from "@/components/dashboard/settings-page";
import { OrderCountStatus } from "@/components/dashboard/order-count-status";
import { RefreshShopifyButton } from "@/components/dashboard/refresh-shopify";
import { PageHeader } from "@/components/dashboard/shell";
import { assertAdmin } from "@/lib/dashboard/session";
import { getDashboardConfig } from "@/lib/dashboard/values";
import { getShopifyConnection } from "@/lib/env";
import { getBlog, getMenu } from "@/lib/shopify";

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
      { label: "Blog posts", path: "/content/articles", note: "Published posts appear at /blogs/<blog handle> and in a Blog posts homepage section." },
      { label: "Pages", path: "/pages", note: "Published pages appear at /pages/<handle>, for example /pages/about-us." },
      { label: "Files", path: "/content/files", note: "Upload images, then paste their address into a homepage section." },
      { label: "Menus", path: "/menus", note: "Pick a Shopify menu as the header menu in Navigation here." },
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

/** What the storefront currently reads from Shopify's content screens. */
async function ContentStatus() {
  await assertAdmin();
  if (getShopifyConnection().mode !== "live") return null;
  const { navigation, homepage } = await getDashboardConfig();
  const blogHandles = [
    ...new Set(["news", ...homepage.sections.flatMap((section) => (section.type === "blogPosts" ? [section.blogHandle] : []))]),
  ];
  const menuHandle = navigation.shopifyMenuHandle || "main-menu";
  const [blogs, menu] = await Promise.all([
    Promise.all(blogHandles.map(async (handle) => ({ handle, blog: await getBlog(handle, { first: 3 }).catch(() => null) }))),
    getMenu(menuHandle).catch(() => []),
  ]);

  return (
    <section className="mb-6 rounded-lg border border-border bg-background p-5 sm:p-6">
      <h2 className="text-base font-semibold">Content on the site</h2>
      <p className="mt-1 text-sm text-muted">Read from Shopify. Changes made in Shopify appear within a few minutes, or at once after Refresh from Shopify.</p>
      <ul className="mt-4 divide-y divide-border text-sm">
        {blogs.map(({ handle, blog }) => (
          <li key={handle} className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
            <span>
              <span className="font-medium">Blog &ldquo;{handle}&rdquo;</span>
              <span className="block text-xs text-muted">
                {blog
                  ? blog.articles.length
                    ? `Latest: ${blog.articles.map((article) => article.title).join(" · ")}`
                    : "No published posts yet."
                  : "Not found in Shopify, or not published to the Headless channel."}
              </span>
            </span>
            {blog ? (
              <a href={`/blogs/${handle}`} target="_blank" rel="noopener" className="text-xs font-medium underline underline-offset-4">
                View on site
              </a>
            ) : null}
          </li>
        ))}
        <li className="flex min-h-12 flex-col justify-center gap-0.5 py-2">
          <span className="font-medium">
            Menu &ldquo;{menuHandle}&rdquo;{" "}
            <span className="font-normal text-muted">
              ({navigation.source === "shopify" ? "used as the header menu" : "not in use; switch it on in Navigation"})
            </span>
          </span>
          <span className="text-xs text-muted">
            {menu.length ? menu.map((item) => item.title).join(" · ") : "Empty or not found."}
          </span>
        </li>
      </ul>
    </section>
  );
}

export default function ShopifyPage() {
  return (
    <>
      <PageHeader
        title="Shopify"
        description="Products, collections, discounts, orders and customers are stored in Shopify. These links open the right Shopify screen in a new tab; changes show on the site within about a minute."
      />
      <RefreshShopifyButton className="-mt-4 mb-6" />
      <Suspense fallback={null}>
        <OrderCountStatus always />
      </Suspense>
      <Suspense fallback={null}>
        <ContentStatus />
      </Suspense>
      <Suspense fallback={<DashboardLoading />}>
        <Links />
      </Suspense>
    </>
  );
}
