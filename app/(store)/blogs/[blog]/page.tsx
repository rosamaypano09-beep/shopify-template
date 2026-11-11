import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSiteConfig } from "@/config";
import { ArticleCard } from "@/components/blog/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLink } from "@/components/ui/site-link";
import { pageMetadata } from "@/lib/seo";
import { getBlog } from "@/lib/shopify";
import { cn } from "@/lib/utils";

type Props = PageProps<"/blogs/[blog]">;

const PAGE_SIZE = 12;

/**
 * A blog written in Shopify admin (Online Store > Blog posts). Shopify's
 * default blog is "news"; other blogs render on first visit and are then cached.
 */
export async function generateStaticParams() {
  return [{ blog: "news" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog: handle } = await params;
  const blog = await getBlog(handle, { first: 1 }).catch(() => null);
  if (!blog) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: blog.seo.title ?? blog.title,
    description: blog.seo.description ?? undefined,
    path: `/blogs/${blog.handle}`,
  });
}

async function BlogContent({ params, searchParams }: Props) {
  const { blog: handle } = await params;
  const query = await searchParams;
  const after = typeof query.after === "string" ? query.after : null;
  const tag = typeof query.tag === "string" && query.tag.trim() ? query.tag.trim().slice(0, 80) : null;
  const [blog, recent] = await Promise.all([
    getBlog(handle, { first: PAGE_SIZE, after, tag }),
    // The newest posts, to offer their tags as filters.
    getBlog(handle, { first: 50 }),
  ]);
  if (!blog) notFound();
  const locale = getSiteConfig().store.locale.language;
  const tags = [...new Set((recent?.articles ?? []).flatMap((article) => article.tags))].sort((a, b) => a.localeCompare(b));
  // The newest post leads the first page, large, when nothing is filtered.
  const lead = !after && !tag && blog.articles.length ? blog.articles[0] : null;
  const rest = lead ? blog.articles.slice(1) : blog.articles;
  const options = { showTags: true, showAuthor: true };
  const chip = "type-small inline-flex min-h-9 items-center rounded-control border px-4 font-medium transition-colors";

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: blog.title, href: `/blogs/${blog.handle}` },
        ]}
      />
      <h1 className="type-h1 mt-4 mb-8">{blog.title}</h1>
      {tags.length ? (
        <nav aria-label="Filter by topic" className="mb-10 sm:mb-14">
          <ul className="flex flex-wrap gap-2">
            <li>
              <SiteLink href={`/blogs/${blog.handle}`} aria-current={!tag ? "page" : undefined} className={cn(chip, !tag ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted hover:border-foreground/50 hover:text-foreground")}>
                All
              </SiteLink>
            </li>
            {tags.map((entry) => (
              <li key={entry}>
                <SiteLink
                  href={`/blogs/${blog.handle}?tag=${encodeURIComponent(entry)}`}
                  aria-current={tag === entry ? "page" : undefined}
                  className={cn(chip, tag === entry ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted hover:border-foreground/50 hover:text-foreground")}
                >
                  {entry}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      {lead ? (
        <div className="mb-14 border-b border-border pb-14">
          <ArticleCard article={lead} locale={locale} variant="lead" options={{ ...options, readMoreLabel: "Read the story" }} priority />
        </div>
      ) : null}
      {rest.length ? (
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, index) => (
            <ArticleCard key={article.id} article={article} locale={locale} options={options} priority={!lead && index < 3} />
          ))}
        </div>
      ) : !lead ? (
        <EmptyState
          title={tag ? `No posts tagged “${tag}”` : "No posts yet"}
          description={tag ? "Try another topic, or see all posts." : "New stories will appear here as soon as they are published."}
        />
      ) : null}
      {blog.pageInfo.hasNextPage && blog.pageInfo.endCursor ? (
        <div className="mt-14 flex justify-center">
          <Button asChild variant="outline">
            <SiteLink href={`/blogs/${blog.handle}?after=${encodeURIComponent(blog.pageInfo.endCursor)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`}>
              Older posts
            </SiteLink>
          </Button>
        </div>
      ) : null}
    </>
  );
}

export default function BlogPage(props: Props) {
  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <BlogContent {...props} />
      </Suspense>
    </div>
  );
}
