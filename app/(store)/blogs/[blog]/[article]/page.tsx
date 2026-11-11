import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSiteConfig } from "@/config";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShopImage } from "@/components/ui/shop-image";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/blog/article-card";
import { SiteLink } from "@/components/ui/site-link";
import { getArticle, getBlog, readingMinutes, type ArticleSummary } from "@/lib/shopify";

type Props = PageProps<"/blogs/[blog]/[article]">;

/** Prerender the newest posts of the default blog; the rest render on first visit and are then cached. */
export async function generateStaticParams() {
  const blog = await getBlog("news", { first: 24 }).catch(() => null);
  const params = (blog?.articles ?? []).map((article) => ({ blog: "news", article: article.handle }));
  // Next.js needs at least one entry; this one simply leads to "page not found".
  return params.length ? params : [{ blog: "news", article: "none" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog, article: handle } = await params;
  const article = await getArticle(blog, handle).catch(() => null);
  if (!article) return { title: "Page not found", robots: { index: false } };
  return pageMetadata({
    title: article.seo.title ?? article.title,
    description: article.seo.description ?? (article.excerpt || undefined),
    path: `/blogs/${article.blogHandle}/${article.handle}`,
    image: article.image?.url,
  });
}

async function ArticleContent({ params }: Pick<Props, "params">) {
  const { blog: blogHandle, article: handle } = await params;
  const [article, blog] = await Promise.all([getArticle(blogHandle, handle), getBlog(blogHandle, { first: 4 })]);
  if (!article) notFound();
  const locale = getSiteConfig().store.locale.language;

  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: blog?.title ?? "Blog", href: `/blogs/${blogHandle}` },
          { label: article.title, href: `/blogs/${blogHandle}/${article.handle}` },
        ]}
      />
      <header className="mt-6 mb-10 flex flex-col gap-4">
        <p className="type-small text-muted">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
          {article.author ? <> · {article.author}</> : null}
          <> · {readingMinutes(article.contentHtml)} min read</>
        </p>
        <h1 className="type-h1">{article.title}</h1>
        {article.standfirst ? <p className="type-body-lg text-muted">{article.standfirst}</p> : null}
      </header>
      {article.image ? (
        <ShopImage
          src={article.image.url}
          alt={article.image.altText ?? ""}
          ratio="landscape"
          sizes="(min-width: 768px) 768px, 100vw"
          priority
          className="mb-10 rounded-lg"
        />
      ) : null}
      <div className="rich-text ce-editorial" dangerouslySetInnerHTML={{ __html: sanitizeRichText(article.contentHtml) }} />
      {article.tags.length ? (
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
          {article.tags.map((tag) => (
            <li key={tag}>
              <SiteLink
                href={`/blogs/${blogHandle}?tag=${encodeURIComponent(tag)}`}
                className="type-caption inline-flex rounded-full bg-primary/12 px-3 py-1 font-semibold text-highlight hover:bg-primary/20"
              >
                {tag}
              </SiteLink>
            </li>
          ))}
        </ul>
      ) : null}
      <RelatedPosts current={article.handle} articles={blog?.articles ?? []} blogHandle={blogHandle} blogTitle={blog?.title ?? "the blog"} locale={locale} />
    </article>
  );
}

function RelatedPosts({
  current,
  articles,
  blogHandle,
  blogTitle,
  locale,
}: {
  current: string;
  articles: ArticleSummary[];
  blogHandle: string;
  blogTitle: string;
  locale: string;
}) {
  const others = articles.filter((article) => article.handle !== current).slice(0, 3);
  if (!others.length) return null;
  return (
    <aside className="mt-16 border-t border-border pt-12" aria-labelledby="more-posts">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="more-posts" className="type-h3">
          More from {blogTitle}
        </h2>
        <SiteLink href={`/blogs/${blogHandle}`} className="type-small font-semibold underline underline-offset-4">
          All posts
        </SiteLink>
      </div>
      <ul className="flex flex-col gap-8">
        {others.map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} locale={locale} variant="row" options={{ showAuthor: false }} />
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function ArticlePage({ params }: Props) {
  return (
    <div className="container-site py-10 sm:py-14">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-3xl" />}>
        <ArticleContent params={params} />
      </Suspense>
    </div>
  );
}
