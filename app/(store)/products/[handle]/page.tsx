import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetail } from "@/components/product/product-detail";
import { RecentlyViewed, TrackProductView } from "@/components/product/recently-viewed";
import { Recommendations } from "@/components/product/recommendations";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { pageMetadata, productJsonLd } from "@/lib/seo";
import { getProduct, getProducts } from "@/lib/shopify";

type Props = PageProps<"/products/[handle]">;

/** Prerender the first 100 products at build; the rest render on first visit and are then cached. */
export async function generateStaticParams() {
  const { products } = await getProducts({ first: 100 });
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product not found", robots: { index: false } };

  return pageMetadata({
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.description,
    path: `/products/${product.handle}`,
    image: product.featuredImage?.url,
  });
}

async function ProductContent({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/collections" },
          { label: product.title, href: `/products/${product.handle}` },
        ]}
      />

      <ProductDetail product={product}>
        {product.description ? (
          <div className="border-t border-border pt-6">
            <h2 className="type-h4 mb-2">About this product</h2>
            <p className="type-body max-w-[60ch] whitespace-pre-line">{product.description}</p>
          </div>
        ) : null}
      </ProductDetail>

      <JsonLd data={productJsonLd(product)} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </>
  );
}

/** Below the product: Shopify's related products, then what this visitor looked at before. */
async function ProductExtras({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return null;

  return (
    <>
      <Recommendations productId={product.id} />
      <RecentlyViewed excludeHandle={product.handle} />
      <TrackProductView handle={product.handle} />
    </>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <>
      <div className="container-site py-8 sm:py-12">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductContent params={params} />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <ProductExtras params={params} />
      </Suspense>
    </>
  );
}
