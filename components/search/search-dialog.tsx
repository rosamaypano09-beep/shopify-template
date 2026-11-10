"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ShopImage } from "@/components/ui/shop-image";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import type { PredictiveSearchResult } from "@/lib/shopify/types";

/** The last search that finished. `result: null` means it failed. */
interface Completed {
  query: string;
  result: PredictiveSearchResult | null;
}

const DEBOUNCE_MS = 220;

/** Header search: a panel that suggests products, collections and terms while typing. */
export function SearchDialog({ locale }: { locale: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<Completed | null>(null);
  const term = query.trim();

  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/predictive?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        setCompleted({ query: term, result: (await response.json()) as PredictiveSearchResult });
      } catch (error) {
        if ((error as Error).name !== "AbortError") setCompleted({ query: term, result: null });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // While a new search is in flight, keep showing the previous results instead of flashing a loader.
  const active = term.length >= 2;
  const failed = active && completed?.query === term && completed.result === null;
  const result = active && !failed ? (completed?.result ?? null) : null;
  const loading = active && !failed && !result;
  const shownQuery = completed?.query ?? term;

  const close = () => setOpen(false);
  const resultsHref = `/search?q=${encodeURIComponent(term)}`;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!term) return;
    track({ name: "search", term });
    close();
    router.push(resultsHref);
  }

  const empty =
    result && !result.products.length && !result.collections.length && !result.suggestions.length;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Dialog.Trigger
        aria-label="Search"
        className="inline-flex size-11 items-center justify-center rounded-control hover:bg-foreground/8"
      >
        <Search aria-hidden className="size-[1.375rem]" strokeWidth={1.75} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/45 data-[state=closed]:animate-[ce-fade-out_var(--ce-motion-base)] data-[state=open]:animate-[ce-fade-in_var(--ce-motion-base)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-50 flex max-h-dvh flex-col bg-background text-foreground shadow-lg data-[state=open]:animate-[ce-fade-in_var(--ce-motion-base)]"
        >
          <Dialog.Title className="sr-only">Search the store</Dialog.Title>

          <form onSubmit={submit} role="search" className="container-site flex h-18 shrink-0 items-center gap-3">
            <Search aria-hidden className="size-5 shrink-0 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={80}
              enterKeyHint="search"
              className="h-12 min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            />
            <Dialog.Close
              aria-label="Close search"
              className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-foreground/8"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </form>

          <div className="overflow-y-auto overscroll-contain border-t border-border" aria-live="polite">
            <div className="container-site">
              {loading ? (
                <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Searching">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16 max-sm:hidden" />
                </div>
              ) : null}

              {failed ? (
                <p role="alert" className="py-6">
                  Search isn&apos;t responding. Press Enter to see full results, or try again in a moment.
                </p>
              ) : null}

              {empty ? (
                <p className="py-6">
                  Nothing matches &ldquo;{shownQuery}&rdquo;. Check the spelling or try a broader word.
                </p>
              ) : null}

              {result && !empty ? (
                <div className="grid gap-x-12 gap-y-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  {result.products.length ? (
                    <section aria-labelledby="search-products">
                      <h2 id="search-products" className="type-small mb-2 text-muted">
                        Products
                      </h2>
                      <ul className="grid gap-x-6 sm:grid-cols-2">
                        {result.products.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/products/${product.handle}`}
                              onClick={close}
                              className="group flex items-center gap-3 rounded-md py-2"
                            >
                              <ShopImage
                                src={product.featuredImage?.url}
                                alt=""
                                sizes="56px"
                                className="w-14 shrink-0 rounded-md"
                              />
                              <span className="min-w-0">
                                <span className="block truncate font-medium underline-offset-4 group-hover:underline">
                                  {product.title}
                                </span>
                                <span className="type-small text-muted tabular-nums">
                                  {product.hasPriceRange ? "From " : ""}
                                  {formatMoney(product.price, locale)}
                                  {product.availableForSale ? "" : ", sold out"}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  <div className="flex flex-col gap-6">
                    {result.collections.length ? (
                      <section aria-labelledby="search-collections">
                        <h2 id="search-collections" className="type-small mb-1 text-muted">
                          Collections
                        </h2>
                        <ul>
                          {result.collections.map((collection) => (
                            <li key={collection.id}>
                              <Link
                                href={`/collections/${collection.handle}`}
                                onClick={close}
                                className="inline-flex min-h-10 items-center font-medium underline-offset-4 hover:underline"
                              >
                                {collection.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {result.suggestions.length ? (
                      <section aria-labelledby="search-suggestions">
                        <h2 id="search-suggestions" className="type-small mb-1 text-muted">
                          Suggestions
                        </h2>
                        <ul>
                          {result.suggestions.map((suggestion) => (
                            <li key={suggestion}>
                              <Link
                                href={`/search?q=${encodeURIComponent(suggestion)}`}
                                onClick={close}
                                className="inline-flex min-h-10 items-center underline-offset-4 hover:underline"
                              >
                                {suggestion}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {active ? (
                <div className="border-t border-border py-4">
                  <Link
                    href={resultsHref}
                    onClick={close}
                    className="inline-flex min-h-11 items-center font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2"
                  >
                    View all results for &ldquo;{term}&rdquo;
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
