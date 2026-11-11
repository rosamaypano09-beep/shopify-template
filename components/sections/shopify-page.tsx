import { ArrowRight } from "lucide-react";
import type { ShopifyPageSectionConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { sanitizeRichText } from "@/lib/content/sanitize";
import { logger } from "@/lib/logger";
import { getPage, type ShopPage } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { Eyebrow, Section } from "./section";

/**
 * Text from a page written in Shopify admin (Online Store > Pages), so the
 * story can be edited where the rest of the store lives. Hidden if the page
 * does not exist or is not published.
 */
export async function ShopifyPageSection({ config }: { config: ShopifyPageSectionConfig }) {
  let page: ShopPage | null = null;
  try {
    page = await getPage(config.pageHandle);
  } catch (error) {
    logger.error("Shopify page section could not load", { scope: "sections", sectionId: config.id, error });
  }
  if (!page) return null;

  const pageHref = `/pages/${page.handle}`;
  const cta = config.cta ?? (config.excerptOnly ? { label: "Read more", href: pageHref } : undefined);
  const image = config.image;
  const centered = config.align === "center" && !image;

  return (
    <Section config={config}>
      <div className={cn("grid items-center gap-10 lg:gap-16", image && "lg:grid-cols-2")}>
        {image ? (
          <ShopImage
            src={image.src}
            alt={image.alt}
            ratio="landscape"
            position={image.position}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn("rounded-lg", config.imageSide === "right" && "lg:order-2")}
          />
        ) : null}
        <div className={cn("flex flex-col gap-5", centered ? "mx-auto max-w-3xl items-center text-center" : "items-start")}>
          {config.eyebrow ? <Eyebrow>{config.eyebrow}</Eyebrow> : null}
          {config.showTitle ? (
            <h2 className="type-h2">
              {page.title}
              {config.titleAccent ? <span className="block text-highlight italic">{config.titleAccent}</span> : null}
            </h2>
          ) : null}
          {config.excerptOnly ? (
            <p className="type-body-lg max-w-[60ch] text-muted">{page.bodySummary}</p>
          ) : (
            <div className={cn("rich-text text-muted", centered && "mx-auto")} dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.body) }} />
          )}
          {cta ? (
            <Button asChild variant={config.excerptOnly && !config.cta ? "outline" : "primary"} className="mt-2">
              <SiteLink href={cta.href}>
                {cta.label}
                <ArrowRight aria-hidden className="size-4" />
              </SiteLink>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
