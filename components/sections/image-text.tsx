import type { ImageTextSectionConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";
import { Eyebrow, Section } from "./section";

/** A picture beside a story: eyebrow, heading with an accent line, text, small cards and a button. */
export function ImageText({ config }: { config: ImageTextSectionConfig }) {
  const cards = (config.cards ?? []).filter((card) => card.title.trim());
  const contain = config.imageFit === "contain";

  return (
    <Section config={config}>
      <div className={cn("grid items-center gap-10 lg:gap-16", config.image && "lg:grid-cols-2")}>
        {config.image ? (
          <ShopImage
            src={config.image.src}
            alt={config.image.alt}
            ratio={contain ? "square" : "landscape"}
            fit={contain ? "contain" : "cover"}
            position={config.image.position}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn("rounded-lg", contain && "bg-surface", config.imageSide === "right" && "lg:order-2")}
          />
        ) : null}
        <div className="flex max-w-[58ch] flex-col items-start gap-5">
          {config.eyebrow ? <Eyebrow>{config.eyebrow}</Eyebrow> : null}
          <h2 className="type-h2">
            {config.title}
            {config.titleAccent ? <span className="block text-highlight italic">{config.titleAccent}</span> : null}
          </h2>
          <p className="type-body-lg whitespace-pre-line text-muted">{config.body}</p>
          {cards.length ? (
            <ul className="mt-2 grid w-full gap-3 sm:grid-cols-2">
              {cards.map((card, index) => (
                <li key={`${card.title}-${index}`} className="rounded-lg border border-border bg-surface/60 p-4">
                  <p className="font-semibold">{card.title}</p>
                  {card.body ? <p className="type-small mt-1 text-muted">{card.body}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {config.cta ? (
            <Button asChild size="lg" className="mt-2">
              <SiteLink href={config.cta.href}>{config.cta.label}</SiteLink>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
