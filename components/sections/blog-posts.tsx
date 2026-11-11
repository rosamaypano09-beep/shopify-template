import type { BlogPostsSectionConfig } from "@/config";
import { getSiteConfig } from "@/config";
import { ArticleCard, type ArticleCardOptions } from "@/components/blog/article-card";
import { logger } from "@/lib/logger";
import { getBlog, type ArticleSummary } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { Section, SectionHeader } from "./section";

const columns = { "2": "sm:grid-cols-2", "3": "sm:grid-cols-2 lg:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" } as const;

/** The newest posts from one Shopify blog, as a grid, a featured layout or a list. Hidden while the blog has no posts. */
export async function BlogPosts({ config }: { config: BlogPostsSectionConfig }) {
  let articles: ArticleSummary[];
  try {
    articles = (await getBlog(config.blogHandle, { first: config.limit, tag: config.tag || null }))?.articles ?? [];
  } catch (error) {
    logger.error("Blog posts could not load", { scope: "sections", sectionId: config.id, error });
    return null;
  }
  if (!articles.length) return null;

  const locale = getSiteConfig().store.locale.language;
  const options: ArticleCardOptions = {
    showExcerpt: config.showExcerpt ?? true,
    showDate: config.showDate ?? true,
    showAuthor: config.showAuthor ?? false,
    showTags: config.showTags ?? false,
    readMoreLabel: config.readMoreLabel,
  };
  const layout = config.layout ?? "grid";

  return (
    <Section config={config}>
      <SectionHeader
        eyebrow={config.eyebrow}
        title={config.title}
        titleAccent={config.titleAccent}
        description={config.description}
        cta={config.cta}
        align={config.align}
      />
      {layout === "featured" && articles.length > 1 ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
          <ArticleCard article={articles[0]} locale={locale} variant="featured" options={options} />
          <ul className="flex flex-col gap-8">
            {articles.slice(1).map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} locale={locale} variant="row" options={{ ...options, showExcerpt: false }} />
              </li>
            ))}
          </ul>
        </div>
      ) : layout === "list" ? (
        <ul className="mx-auto flex max-w-3xl flex-col divide-y divide-border">
          {articles.map((article) => (
            <li key={article.id} className="py-6 first:pt-0">
              <ArticleCard article={article} locale={locale} variant="row" options={options} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={cn("grid gap-x-8 gap-y-12", columns[config.columns ?? "3"])}>
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} locale={locale} variant={layout === "featured" ? "featured" : "card"} options={options} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
