import Image from "next/image";
import type { LogoMarqueeSectionConfig } from "@/config";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";
import { Section } from "./section";

type Item = LogoMarqueeSectionConfig["items"][number];

function Logo({ item }: { item: Item }) {
  const content = item.logo ? (
    <Image
      src={item.logo}
      alt={item.name}
      width={160}
      height={48}
      unoptimized={item.logo.endsWith(".svg")}
      className="h-10 w-auto max-w-40 object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
  ) : (
    <span className="type-h4 whitespace-nowrap opacity-75">{item.name}</span>
  );
  return item.href ? (
    <SiteLink href={item.href} aria-label={item.logo ? item.name : undefined} className="inline-flex min-h-11 items-center">
      {content}
    </SiteLink>
  ) : (
    content
  );
}

/**
 * "Trusted by" row of partner or press logos. Scrolls sideways when
 * `animated` is on; pauses on hover and keyboard focus, and stands still for
 * visitors who ask their device for less motion.
 */
export function LogoMarquee({ config }: { config: LogoMarqueeSectionConfig }) {
  const items = config.items.filter((item) => item.name.trim());
  if (!items.length) return null;
  const row = "flex shrink-0 items-center gap-x-14 pr-14";

  return (
    <Section id={config.id} background={config.background} compact>
      {config.title ? <p className="type-small mb-6 text-center opacity-75">{config.title}</p> : null}
      {config.animated && items.length > 3 ? (
        <div className="ce-marquee group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul className={cn(row, "ce-marquee-track")}>
            {items.map((item) => (
              <li key={item.name}>
                <Logo item={item} />
              </li>
            ))}
          </ul>
          {/* A second copy makes the loop seamless. Hidden from screen readers and the keyboard. */}
          <ul className={cn(row, "ce-marquee-track")} aria-hidden inert>
            {items.map((item) => (
              <li key={item.name}>
                <Logo item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {items.map((item) => (
            <li key={item.name}>
              <Logo item={item} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
