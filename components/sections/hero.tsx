import type { CSSProperties } from "react";
import type { HeroSectionConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

const step = (n: number) => ({ "--rise-step": n }) as CSSProperties;

function HeroCopy({ config, centered }: { config: HeroSectionConfig; centered?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-6", centered ? "items-center text-center" : "items-start")}>
      <h1 className={cn("type-display animate-rise", centered ? "max-w-[16ch]" : "max-w-[13ch]")} style={step(0)}>
        {config.title}
      </h1>
      {config.subtitle ? (
        <p className="type-body-lg animate-rise max-w-[46ch] text-muted" style={step(1)}>
          {config.subtitle}
        </p>
      ) : null}
      {config.primaryCta || config.secondaryCta ? (
        <div className="animate-rise mt-2 flex flex-wrap items-center gap-x-6 gap-y-3" style={step(2)}>
          {config.primaryCta ? (
            <Button asChild size="lg">
              <SiteLink href={config.primaryCta.href}>{config.primaryCta.label}</SiteLink>
            </Button>
          ) : null}
          {config.secondaryCta ? (
            <Button asChild variant="link">
              <SiteLink href={config.secondaryCta.href}>{config.secondaryCta.label}</SiteLink>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The first screen. `split` puts copy beside the image; `centered` stacks
 * them. Without an image either variant falls back to type on its own.
 */
export function Hero({ config }: { config: HeroSectionConfig }) {
  const { image } = config;

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
