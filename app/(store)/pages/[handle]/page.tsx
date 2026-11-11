import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { pageMetadata } from "@/lib/seo";
import { pageHref, ShopifyPageView } from "@/components/content/shopify-page-view";
import { getPage } from "@/lib/shopify";

type Props = PageProps<"/pages/[handle]">;

/**
 * Pages written in Shopify admin (Online Store > Pages), such as "About us"
 * or "Contact". They render on first visit and are then cached.
 */
export async function generateStaticParams() {
  // Next.js needs at least one entry; Shopify creates "contact" in every new store.
  return [{ handle: "contact" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle).catch(() => null);
  if (!page) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? (page.bodySummary || undefined),
    // The About page is also shown at /about; search engines are pointed there.
    path: pageHref(page.handle),
  });
}

async function PageContent({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) notFound();
  return <ShopifyPageView page={page} />;
}

export default function ShopifyPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="container-site my-10 h-96" />}>
      <PageContent params={params} />
    </Suspense>
  );
}
