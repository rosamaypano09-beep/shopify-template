import { ArrowRight } from "lucide-react";
import { Suspense, type CSSProperties } from "react";
import type { CtaConfig, HeroSectionConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { logger } from "@/lib/logger";
import { getProduct } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { HeroAddToCart } from "./hero-add-to-cart";

const step = (n: number) => ({ "--rise-step": n }) as CSSProperties;

function HeroCopy({ config, centered }: { config: HeroSectionConfig; centered?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-6", centered ? "items-center text-center" : "items-start")}>
      {config.eyebrow ? (
        <p className="type-caption animate-rise font-semibold tracking-[0.18em] text-highlight uppercase" style={step(0)}>
          {config.eyebrow}
        </p>
      ) : null}
      <h1 className={cn("type-display animate-rise", centered ? "max-w-[16ch]" : "max-w-[13ch]")} style={step(0)}>
        {config.title}
        {config.titleAccent ? <span className="block text-highlight">{config.titleAccent}</span> : null}
      </h1>
      {config.subtitle ? (
        <p className="type-body-lg animate-rise max-w-[46ch] text-muted" style={step(1)}>
          {config.subtitle}
        </p>
      ) : null}
      {config.primaryCta || config.secondaryCta || config.addToCartHandle ? (
        <div className="animate-rise mt-2 flex flex-wrap items-center gap-x-6 gap-y-3" style={step(2)}>
          <PrimaryAction config={config} />
          {config.secondaryCta ? (
            <Button asChild variant="link">
              <SiteLink href={config.secondaryCta.href}>{config.secondaryCta.label}</SiteLink>
            </Button>
          ) : null}
        </div>
      ) : null}
      {config.proof ? <Proof text={config.proof} /> : null}
    </div>
  );
}

function Proof({ text }: { text: string }) {
  return (
    <p className="type-caption animate-rise flex items-center gap-2.5 text-muted" style={step(3)}>
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
      {text}
    </p>
  );
}

function LinkButton({ cta, className }: { cta: CtaConfig; className?: string }) {
  return (
    <Button asChild size="lg" className={className}>
      <SiteLink href={cta.href}>
        {cta.label}
        <ArrowRight aria-hidden className="size-4" />
      </SiteLink>
    </Button>
  );
}

/**
 * Adds the configured product to the cart. Falls back to the button's link (or
 * the product page) when the product is missing or nothing is for sale.
 */
async function AddToCartAction({ config, className }: { config: HeroSectionConfig; className?: string }) {
  const handle = config.addToCartHandle!;
  const fallback: CtaConfig = config.primaryCta ?? { label: "Shop now", href: `/products/${handle}` };
  let product = null;
  try {
    product = await getProduct(handle);
  } catch (error) {
    logger.error("Hero product could not load", { scope: "sections", sectionId: config.id, error });
  }
  // A named variant ("Whole") must itself be for sale; never swap in a different size.
  const wanted = config.addToCartVariant?.trim().toLowerCase();
  const variant = product?.variants.find((v) => v.availableForSale && (!wanted || v.title.toLowerCase() === wanted));
  if (!product || !variant) return <LinkButton cta={fallback} className={className} />;

  return (
    <HeroAddToCart
      merchandiseId={variant.id}
      label={fallback.label}
      productTitle={product.title}
      variantTitle={product.variants.length > 1 ? variant.title : undefined}
      price={variant.price}
      className={className}
    />
  );
}

function PrimaryAction({ config }: { config: HeroSectionConfig }) {
  const spotlight = config.variant === "spotlight";
  const className = spotlight
    ? "uppercase tracking-[0.1em] shadow-lg sm:tracking-[0.14em]"
    : undefined;
  if (config.addToCartHandle) {
    const fallback = config.primaryCta ?? { label: "Shop now", href: `/products/${config.addToCartHandle}` };
    return (
      <Suspense fallback={<LinkButton cta={fallback} className={className} />}>
        <AddToCartAction config={config} className={className} />
      </Suspense>
    );
  }
  return config.primaryCta ? <LinkButton cta={config.primaryCta} className={className} /> : null;
}

/** Dark band, uppercase serif headline with an accent second line, ruled copy and a glowing photo. */
function Spotlight({ config }: { config: HeroSectionConfig }) {
  const { image } = config;
  return (
    <section id={config.id} className="relative isolate overflow-hidden">
      {/* Soft glow behind the photo, tinted with the brand colour. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-10%] -z-10 aspect-square w-[min(110vw,58rem)] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-primary)_38%,transparent),transparent)] blur-2xl max-lg:top-[78%]"
      />
      <div className="container-site grid min-h-[min(calc(100svh-var(--ce-header-height)),56rem)] items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:py-20">
        <div className="flex min-w-0 flex-col items-start gap-5 sm:gap-6">
          {config.eyebrow ? (
            <p className="type-caption animate-rise font-semibold tracking-[0.16em] text-highlight uppercase sm:tracking-[0.22em]" style={step(0)}>
              {config.eyebrow}
            </p>
          ) : null}
          <h1 className="type-display animate-rise max-w-[14ch] uppercase max-sm:text-[2.6rem]" style={step(0)}>
            {config.title}
            {config.titleAccent ? <span className="block text-highlight">{config.titleAccent}</span> : null}
          </h1>
          {config.subtitle ? (
            <p className="type-body animate-rise max-w-[42ch] border-l-2 border-primary pl-4 text-muted" style={step(1)}>
              {config.subtitle}
            </p>
          ) : null}
          <div className="animate-rise mt-2 flex flex-wrap items-center gap-x-6 gap-y-3" style={step(2)}>
            <PrimaryAction config={config} />
            {config.secondaryCta ? (
              <Button asChild variant="link">
                <SiteLink href={config.secondaryCta.href}>{config.secondaryCta.label}</SiteLink>
              </Button>
            ) : null}
          </div>
          {config.proof ? <Proof text={config.proof} /> : null}
        </div>

        {image ? (
          <div className="animate-rise relative" style={step(1)}>
            {image.mobileSrc ? (
              <ShopImage
                src={image.mobileSrc}
                alt={image.alt}
                ratio="square"
                position={image.position}
                sizes="100vw"
                priority
                className="bg-transparent sm:hidden"
              />
            ) : null}
            <ShopImage
              src={image.src}
              alt={image.alt}
              ratio="landscape"
              position={image.position}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              // Fades the photo's edges into the page so a dark product shot sits in the band.
              className={cn(
                "bg-transparent [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_78%)]",
                image.mobileSrc && "max-sm:hidden",
              )}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The first screen. `split` puts copy beside the image; `centered` stacks
 * them; `spotlight` is the dark editorial layout. Without an image, split and
 * centered fall back to type on its own.
 */
export function Hero({ config }: { config: HeroSectionConfig }) {
  const { image } = config;

  if (config.variant === "spotlight") return <Spotlight config={config} />;

  if (config.variant === "centered" || !image) {
    return (
      <section id={config.id} className="pt-10 pb-section sm:pt-16">
        <div className="container-site flex flex-col gap-10 sm:gap-14">
          <HeroCopy config={config} centered={config.variant === "centered"} />
          {image ? (
            <ShopImage
              src={image.src}
              alt={image.alt}
              ratio="wide"
              position={image.position}
              sizes="(min-width: 1400px) 1320px, 100vw"
              priority
              className="animate-rise rounded-lg max-sm:aspect-[4/5]"
            />
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id={config.id} className="pt-6 pb-section sm:pt-10">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="lg:py-10">
          <HeroCopy config={config} />
        </div>
        <div className="animate-rise" style={step(1)}>
          {/* Art-directed crop: an optional separate image for small screens. */}
          {image.mobileSrc ? (
            <ShopImage
              src={image.mobileSrc}
              alt={image.alt}
              ratio="square"
              position={image.position}
              sizes="100vw"
              priority
              className="rounded-lg sm:hidden"
            />
          ) : null}
          <ShopImage
            src={image.src}
            alt={image.alt}
            ratio="auto"
            position={image.position}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className={cn(
              "aspect-[6/5] rounded-lg lg:aspect-[12/11]",
              image.mobileSrc && "max-sm:hidden",
            )}
          />
        </div>
      </div>
    </section>
  );
}
