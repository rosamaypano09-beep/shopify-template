import type { ImageTextSectionConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";
import { Section } from "./section";

export function ImageText({ config }: { config: ImageTextSectionConfig }) {
  return (
    <Section id={config.id} background={config.background}>
      <div className={cn("grid items-center gap-8 lg:gap-16", config.image && "lg:grid-cols-2")}>
        {config.image ? (
          <ShopImage
            src={config.image.src}
            alt={config.image.alt}
            ratio="landscape"
            position={config.image.position}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn("rounded-lg", config.imageSide === "right" && "lg:order-2")}
          />
        ) : null}
        <div className="flex max-w-[56ch] flex-col items-start gap-5">
          <h2 className="type-h2">{config.title}</h2>
          <p className="type-body-lg whitespace-pre-line opacity-80">{config.body}</p>
          {config.cta ? (
            <Button asChild size="lg" variant={config.background === "primary" ? "accent" : "primary"}>
              <SiteLink href={config.cta.href}>{config.cta.label}</SiteLink>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
