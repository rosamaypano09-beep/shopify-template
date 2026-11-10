import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { pageMetadata } from "@/lib/seo";
import { getPolicies } from "@/lib/shopify";

type Props = PageProps<"/policies/[handle]">;

/**
 * Policy pages show exactly what the store owner wrote in Shopify admin
 * (Settings > Policies). The engine never writes legal text.
 */
export async function generateStaticParams() {
  const policies = await getPolicies();
  // Next.js needs at least one entry; this one simply leads to "page not found".
  return policies.length ? policies.map((policy) => ({ handle: policy.handle })) : [{ handle: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const policy = (await getPolicies()).find((entry) => entry.handle === handle);
  if (!policy) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({ title: policy.title, path: `/policies/${policy.handle}` });
}

async function PolicyContent({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const policy = (await getPolicies()).find((entry) => entry.handle === handle);
  if (!policy) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: policy.title, href: `/policies/${policy.handle}` },
        ]}
      />
      <h1 className="type-h1 mt-4 mb-10">{policy.title}</h1>
      <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichText(policy.body) }} />
    </>
  );
}

export default function PolicyPage({ params }: Props) {
  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense fallback={<Skeleton className="h-96 max-w-3xl" />}>
        <PolicyContent params={params} />
      </Suspense>
    </div>
  );
}
