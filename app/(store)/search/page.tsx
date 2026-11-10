import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Suspense } from "react";
import { SortSelect } from "@/components/collection/sort-select";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  isSort,
  listingHref,
  MAX_SHOWN,
  PAGE_SIZE,
  parseListingParams,
  SEARCH_SORT_OPTIONS,
} from "@/lib/catalog/params";
import { logger } from "@/lib/logger";
import { cleanQuery, searchProducts, type SearchResult } from "@/lib/shopify";

type Props = PageProps<"/search">;

const DEFAULT_SORT = "relevance";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

function SearchForm({ query }: { query: string }) {
  return (
    <form action="/search" method="get" role="search" className="flex max-w-2xl items-center gap-2">
      <div className="relative flex-1">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          aria-label="Search products"
          placeholder="Search products"
          maxLength={80}
          autoComplete="off"
          enterKeyHint="search"
          className="h-12 w-full rounded-control border border-foreground/25 bg-background pr-4 pl-12 text-base hover:border-foreground/50"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}

async function SearchContent({ searchParams }: Pick<Props, "searchParams">) {
  const raw = await searchParams;
  const query = cleanQuery(typeof raw.q === "string" ? raw.q : "");
  const state = parseListingParams(raw, DEFAULT_SORT);
  const sort = isSort(state.sort, SEARCH_SORT_OPTIONS) ? state.sort : DEFAULT_SORT;

  let result: SearchResult | null = null;
  let failed = false;
  if (query) {
    try {
      result = await searchProducts(query, { first: state.show, sort });
    } catch (error) {
      logger.error("Search failed", { scope: "search", error });
      failed = true;
    }
  }

  const base = { ...state, filterIds: [], min: null, max: null };
  const href = (next: Partial<typeof base>) => listingHref("/search", { ...base, ...next }, DEFAULT_SORT, { q: query });

  return (
    <>
      <h1 className="type-h1 mb-6">{query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}</h1>
      <SearchForm query={query} />

      <div className="mt-10">
        {failed ? (
          <EmptyState
            title="Search isn't responding"
            description="The store couldn't be searched just now. Try again in a moment, or browse the collections."
            action={
              <Button asChild>
                <Link href="/collections">Browse the shop</Link>
              </Button>
            }
          />
        ) : !query ? (
          <p className="text-muted">Type a product name, a need or an ingredient.</p>
        ) : result && result.products.length ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
              <p className="type-small text-muted" role="status">
                {result.totalCount} {result.totalCount === 1 ? "product" : "products"}
              </p>
              <SortSelect
                value={sort}
                options={SEARCH_SORT_OPTIONS.map((option) => ({
                  ...option,
                  href: href({ sort: option.value, show: PAGE_SIZE }),
                }))}
              />
            </div>
            <ProductGrid products={result.products} priorityCount={4} />
            {result.pageInfo.hasNextPage && state.show < MAX_SHOWN ? (
              <div className="mt-12 flex justify-center">
                <Button asChild variant="outline" size="lg">
                  <Link href={href({ show: state.show + PAGE_SIZE })} scroll={false}>
                    Show more products
                  </Link>
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title={`Nothing matches "${query}"`}
            description="Check the spelling, try a broader word, or browse the collections."
            action={
              <Button asChild>
                <Link href="/collections">Browse the shop</Link>
              </Button>
            }
          />
        )}
      </div>
    </>
  );
}

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
