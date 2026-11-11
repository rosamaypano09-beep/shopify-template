import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/config";
import { Suspense } from "react";
import { ShopifyPageView } from "@/components/content/shopify-page-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { Skeleton } from "@/components/ui/skeleton";
import { pageMetadata } from "@/lib/seo";
import { getPage } from "@/lib/shopify";
import { cn } from "@/lib/utils";

/** The About page written in Shopify, when one is set and published. */
async function shopifyAbout() {
  const handle = getSiteConfig().pages.about.shopifyPage;
  return handle ? getPage(handle).catch(() => null) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const { about } = getSiteConfig().pages;
  const page = await shopifyAbout();
  if (page) {
    return pageMetadata({ title: page.seo.title ?? page.title, description: page.seo.description ?? (page.bodySummary || undefined), path: "/about" });
  }
  return pageMetadata({ title: about.title, description: about.intro, path: "/about" });
}

export default function AboutPage() {
  if (!getSiteConfig().pages.about.enabled) notFound();
  return (
    <Suspense fallback={<Skeleton className="container-site my-10 h-96" />}>
      <AboutContent />
    </Suspense>
  );
}

/** The Shopify page when there is one; otherwise the text written in config/pages.config.ts. */
async function AboutContent() {
  const page = await shopifyAbout();
  if (page) return <ShopifyPageView page={page} />;
  return <FallbackAbout />;
}

function FallbackAbout() {
  const { about } = getSiteConfig().pages;

  return (
    <div className="container-site py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
      />
      <header className="mt-4 mb-section flex max-w-[52rem] flex-col gap-5">
        <h1 className="type-h1">{about.title}</h1>
        <p className="type-body-lg text-muted">{about.intro}</p>
      </header>

      <div className="flex flex-col gap-section">
        {about.blocks.map((block, index) => (
          <section
            key={block.title}
            className={cn("grid items-center gap-8 lg:gap-16", block.image && "lg:grid-cols-2")}
          >
            {block.image ? (
              <ShopImage
                src={block.image.src}
                alt={block.image.alt}
                ratio="landscape"
                position={block.image.position}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={cn("rounded-lg", index % 2 === 1 && "lg:order-2")}
              />
            ) : null}
            <div className="flex max-w-[56ch] flex-col gap-4">
              <h2 className="type-h2">{block.title}</h2>
              <p className="type-body-lg whitespace-pre-line text-muted">{block.body}</p>
            </div>
          </section>
        ))}
      </div>

      {about.stats?.length ? (
        <dl className="mt-section grid gap-8 border-y border-border py-10 sm:grid-cols-3">
          {about.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              <dt className="text-muted">{stat.label}</dt>
              <dd className="type-h1">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {about.cta ? (
        <div className="mt-section">
          <Button asChild size="lg">
            <SiteLink href={about.cta.href}>{about.cta.label}</SiteLink>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
