import { ArrowRight } from "lucide-react";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { formatDate } from "@/lib/format";
import type { ArticleSummary } from "@/lib/shopify";
import { cn } from "@/lib/utils";

export interface ArticleCardOptions {
  showExcerpt?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  showTags?: boolean;
  readMoreLabel?: string;
}

interface ArticleCardProps {
  article: ArticleSummary;
  locale: string;
  /** `card`: image above text. `featured`: a large card. `row`: image beside text. `lead`: large, image beside text on wide screens. */
  variant?: "card" | "featured" | "row" | "lead";
  options?: ArticleCardOptions;
  priority?: boolean;
  sizes?: string;
}

/** A blog post teaser. Everything shown comes from the post in Shopify. */
export function ArticleCard({ article, locale, variant = "card", options = {}, priority, sizes }: ArticleCardProps) {
  const { showExcerpt = true, showDate = true, showAuthor = true, showTags = false, readMoreLabel } = options;
  const href = `/blogs/${article.blogHandle}/${article.handle}`;
  const row = variant === "row";
  const lead = variant === "lead";
  const featured = variant === "featured" || lead;
  const meta = [showDate ? formatDate(article.publishedAt, locale) : null, showAuthor ? article.author : null].filter(Boolean);

  return (
    <article
      className={cn(
        "group/article relative flex gap-4",
        row ? "flex-row items-start gap-5" : "flex-col",
        lead && "lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-12",
      )}
    >
      <div className={cn("overflow-hidden rounded-lg", row && "w-32 shrink-0 sm:w-44")}>
        <ShopImage
          src={article.image?.url}
          alt={article.image?.altText ?? ""}
          ratio={row ? "square" : lead ? "landscape" : featured ? "wide" : "landscape"}
          sizes={sizes ?? (row ? "176px" : featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw")}
          priority={priority}
          imageClassName="transition-transform duration-(--ce-motion-slow) ease-brand group-hover/article:scale-[1.03]"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {showTags && article.tags.length ? (
          <ul className="relative z-10 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <li key={tag}>
                <SiteLink
                  href={`/blogs/${article.blogHandle}?tag=${encodeURIComponent(tag)}`}
                  className="type-caption inline-flex rounded-full bg-primary/12 px-2.5 py-0.5 font-semibold text-highlight hover:bg-primary/20"
                >
                  {tag}
                </SiteLink>
              </li>
            ))}
          </ul>
        ) : null}
        {meta.length ? (
          <p className="type-caption text-muted">
            {showDate ? <time dateTime={article.publishedAt}>{meta[0]}</time> : meta[0]}
            {meta.length > 1 ? <> · {meta[1]}</> : null}
          </p>
        ) : null}
        <h3 className={featured ? "type-h2" : row ? "type-h4" : "type-h3"}>
          {/* The stretched link makes the whole card clickable with one tab stop. */}
          <SiteLink href={href} className="underline-offset-4 after:absolute after:inset-0 hover:underline">
            {article.title}
          </SiteLink>
        </h3>
        {showExcerpt && article.excerpt ? (
          <p className={cn("text-muted", featured ? "type-body-lg line-clamp-4" : "type-small line-clamp-3")}>{article.excerpt}</p>
        ) : null}
        {readMoreLabel ? (
          <span className="type-small mt-1 inline-flex items-center gap-1.5 font-semibold text-highlight">
            {readMoreLabel}
            <ArrowRight aria-hidden className="size-3.5 transition-transform duration-(--ce-motion-fast) group-hover/article:translate-x-0.5" />
          </span>
        ) : null}
      </div>
    </article>
  );
}
