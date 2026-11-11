import { ArrowRight } from "lucide-react";
import { getSiteConfig } from "@/config";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SiteLink } from "@/components/ui/site-link";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { listContent, type ShopPage } from "@/lib/shopify";

/**
 * Where a Shopify page lives on this site. The page chosen as the About page
 * (pages.about.shopifyPage) is shown at /about; every other page at /pages/handle.
 */
export function pageHref(handle: string): string {
  const { about } = getSiteConfig().pages;
  return about.enabled && about.shopifyPage === handle ? "/about" : `/pages/${handle}`;
}

/**
 * A page written in Shopify admin (Online Store > Pages), in the editorial
 * layout: centred title on a soft glow, a reading column, and links to the
 * store's other pages so new ones are always reachable.
 */
export async function ShopifyPageView({ page }: { page: ShopPage }) {
  const { store } = getSiteConfig();
  const index = await listContent().catch(() => ({ pages: [], blogs: [], articles: [] }));
  const others = index.pages.filter((entry) => entry.handle !== page.handle).slice(0, 6);
  const path = pageHref(page.handle);

  return (
    <article>
      {/* Header: centred title on a soft brand glow. */}
      <header className="ce-band-glow relative overflow-hidden border-b border-border">
        <div className="container-site flex flex-col items-center gap-5 pt-8 pb-14 text-center sm:pt-10 sm:pb-20">
          <Breadcrumbs
            className="self-start"
            items={[
              { label: "Home", href: "/" },
              { label: page.title, href: path },
            ]}
          />
          <p className="type-caption mt-4 flex items-center gap-3 font-semibold tracking-[0.22em] text-highlight uppercase sm:mt-8">
            <span aria-hidden className="h-px w-8 bg-current" />
            {store.name}
            <span aria-hidden className="h-px w-8 bg-current" />
          </p>
          <h1 className="type-display max-w-[16ch] text-balance max-sm:text-[2.75rem]">{page.title}</h1>
        </div>
      </header>

      <div className="container-site py-12 sm:py-20">
        <div className="rich-text ce-editorial" dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.body) }} />
      </div>

      {/* Every other page written in Shopify, so new ones are always reachable. */}
      {others.length ? (
        <nav aria-label="More pages" className="border-t border-border bg-surface">
          <div className="container-site flex flex-col gap-6 py-12 sm:py-16">
            <p className="type-caption font-semibold tracking-[0.2em] text-highlight uppercase">More from {store.name}</p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((entry) => (
                <li key={entry.handle}>
                  <SiteLink
                    href={pageHref(entry.handle)}
                    className="group flex min-h-16 items-center justify-between gap-4 rounded-lg border border-border bg-background px-5 py-4 transition-colors hover:border-primary"
                  >
                    <span className="type-h4">{entry.title}</span>
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-highlight transition-transform group-hover:translate-x-0.5" />
                  </SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </article>
  );
}
