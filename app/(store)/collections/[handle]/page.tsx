import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSiteConfig } from "@/config";
import { CollectionIntro } from "@/components/collection/collection-intro";
import { FilterDrawer } from "@/components/collection/filter-drawer";
import { FilterPanel } from "@/components/collection/filter-panel";
import { SortSelect } from "@/components/collection/sort-select";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activeFilterCount,
  clearFilters,
  filterInputs,
  isSort,
  listingHref,
  MAX_SHOWN,
  PAGE_SIZE,
  parseListingParams,
  SORT_OPTIONS,
} from "@/lib/catalog/params";
import { pageMetadata } from "@/lib/seo";
import { getCollection, getCollections } from "@/lib/shopify";

type Props = PageProps<"/collections/[handle]">;

const DEFAULT_SORT = "featured";

/** Prerender every collection at build; new ones render on first visit and are then cached. */
export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle, { first: 1 });
  if (!collection) return { title: "Collection not found", robots: { index: false } };

  return pageMetadata({
    title: collection.seo.title ?? collection.title,
    description: collection.seo.description ?? collection.description,
    // Filtered and sorted views all point search engines at the plain collection URL.
    path: `/collections/${collection.handle}`,
    image: collection.image?.url,
  });
}

async function CollectionContent({ params, searchParams }: Props) {
  const { handle } = await params;
  const state = parseListingParams(await searchParams, DEFAULT_SORT);
  const sort = isSort(state.sort, SORT_OPTIONS) ? state.sort : DEFAULT_SORT;
  const path = `/collections/${handle}`;

  // First read: does it exist, and which filters does this store offer for it?
  const base = await getCollection(handle, { first: 1 });
  if (!base) notFound();

  const collection =
    (await getCollection(handle, { first: state.show, sort, filters: filterInputs(state, base.filters) })) ?? base;

  const { store } = getSiteConfig();
  const count = collection.products.length;
  const filtersOn = activeFilterCount(state);
  const hasFilters = base.filters.some((group) => group.values.length > 0);
  const panel = (idPrefix: string) => (
    <FilterPanel
      groups={collection.filters.length ? collection.filters : base.filters}
      state={state}
      path={path}
      defaultSort={DEFAULT_SORT}
      currency={store.locale.currency}
      idPrefix={idPrefix}
    />
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/collections" },
          { label: collection.title, href: path },
        ]}
      />
      <header className="mt-4 mb-8 flex flex-col gap-4 sm:mb-10">
        <h1 className="type-h1">{collection.title}</h1>
        {collection.description ? (
          <CollectionIntro text={collection.description} />
        ) : null}
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <div className="flex items-center gap-4">
          {hasFilters ? <FilterDrawer activeCount={filtersOn}>{panel("drawer")}</FilterDrawer> : null}
          <p className="type-small text-muted" role="status">
            {count}
            {collection.pageInfo.hasNextPage ? "+" : ""} {count === 1 ? "product" : "products"}
            {filtersOn ? ", filtered" : ""}
          </p>
        </div>
        <SortSelect
          value={sort}
          options={SORT_OPTIONS.map((option) => ({
            ...option,
            href: listingHref(path, { ...state, sort: option.value, show: PAGE_SIZE }, DEFAULT_SORT),
          }))}
        />
      </div>

      <div className={hasFilters ? "grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]" : undefined}>
        {hasFilters ? (
          <aside aria-label="Filters" className="max-lg:hidden">
            {panel("sidebar")}
          </aside>
        ) : null}

        <div>
          {count ? (
            <ProductGrid
              products={collection.products}
              priorityCount={4}
              className={hasFilters ? "lg:grid-cols-3" : undefined}
            />
          ) : filtersOn ? (
            <EmptyState
              title="No products match these filters"
              description="Remove a filter or two to see more."
              action={
                <Button asChild>
                  <Link href={listingHref(path, clearFilters(state), DEFAULT_SORT)} scroll={false}>
                    Clear all filters
                  </Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Nothing in this collection yet"
              description="The rest of the range is available now."
              action={
                <Button asChild>
                  <Link href="/collections">Browse the shop</Link>
                </Button>
              }
            />
          )}

          {collection.pageInfo.hasNextPage && state.show < MAX_SHOWN ? (
            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link
                  href={listingHref(path, { ...state, show: state.show + PAGE_SIZE }, DEFAULT_SORT)}
                  scroll={false}
                >
                  Show more products
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function CollectionSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-48" />
      <div className="mt-4 mb-10 flex flex-col gap-4 sm:mb-14">
        <Skeleton className="h-14 w-2/3 max-w-md" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </div>
      <ProductGridSkeleton />
    </>
  );
}

export default function CollectionPage(props: Props) {
  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense fallback={<CollectionSkeleton />}>
        <CollectionContent {...props} />
      </Suspense>
    </div>
  );
}
