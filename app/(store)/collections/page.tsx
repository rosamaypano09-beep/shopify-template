import type { Metadata } from "next";
import { CollectionCard } from "@/components/collection/collection-card";
import { ProductGrid } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { pageMetadata } from "@/lib/seo";
import { getCollections, getProducts } from "@/lib/shopify";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Shop", path: "/collections" });
}

export default async function ShopPage() {
  const [collections, { products }] = await Promise.all([getCollections(), getProducts({ first: 24 })]);

  return (
    <div className="container-site py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/collections" },
        ]}
      />
      <h1 className="type-h1 mt-4 mb-10 sm:mb-14">Shop</h1>

      {collections.length ? (
        <section aria-labelledby="collections-heading" className="mb-section">
          <h2 id="collections-heading" className="type-h3 mb-6">
            Collections
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {collections.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="products-heading">
        <h2 id="products-heading" className="type-h3 mb-6">
          All products
        </h2>
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No products yet"
            description="Products published to the Headless sales channel in Shopify appear here."
          />
        )}
      </section>
    </div>
  );
}
