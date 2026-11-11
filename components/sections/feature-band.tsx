import type { FeatureBandSectionConfig, FeatureStat } from "@/config";
import { getSiteConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import { statFromCount } from "@/lib/format";
import { getOrdersCount } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";
import { sectionIcons } from "./icons";
import { Section, SectionHeader } from "./section";

type Item = FeatureBandSectionConfig["items"][number];
type ItemStyle = NonNullable<FeatureBandSectionConfig["itemStyle"]>;
type IconShape = NonNullable<FeatureBandSectionConfig["iconShape"]>;

const columnClasses = {
  "2": "grid gap-2.5 sm:gap-3 sm:grid-cols-2",
  "3": "grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4",
  auto: "flex flex-wrap gap-2.5 sm:gap-3",
} as const;
/** Short chip styles fit two to a row even on a small phone. */
const compactOnPhones = new Set<ItemStyle>(["chips", "icons"]);

const shapes: Record<IconShape, string> = {
  circle: "rounded-full bg-primary/15",
  square: "rounded-md bg-primary/15",
  plain: "",
};

function ItemIcon({ item, shape, large }: { item: Item; shape: IconShape; large?: boolean }) {
  const Icon = sectionIcons[item.icon] ?? sectionIcons.check;
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center text-highlight", large ? "size-14" : "size-7 sm:size-8", shapes[shape])}>
      <Icon aria-hidden className={large ? "size-6" : "size-3.5 sm:size-4"} />
    </span>
  );
}

/** The item's text and, when set, its second line underneath. */
function Label({ item, center, onBrand }: { item: Item; center?: boolean; onBrand?: boolean }) {
  return (
    <span className={cn("flex min-w-0 flex-col gap-0.5", center && "items-center text-center")}>
      <span className="font-medium tracking-[0.005em]">{item.text}</span>
      {item.body ? (
        <span className={cn("text-[0.75rem] leading-snug font-normal sm:text-[0.8125rem]", onBrand ? "opacity-85" : "text-muted")}>{item.body}</span>
      ) : null}
    </span>
  );
}

/** One item, drawn in the chosen style. */
function FeatureItem({ item, style, shape }: { item: Item; style: ItemStyle; shape: IconShape }) {
  switch (style) {
    case "cards":
      return (
        <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface/70 p-5">
          <ItemIcon item={item} shape={shape} />
          <p className="font-heading text-lg leading-snug">{item.text}</p>
          {item.body ? <p className="type-small leading-relaxed text-muted">{item.body}</p> : null}
        </div>
      );
    case "icons":
      return (
        <div className="flex flex-col items-center gap-3 px-2 text-center">
          <ItemIcon item={item} shape={shape === "plain" ? "plain" : shape} large />
          <p className="font-heading text-lg leading-snug">{item.text}</p>
          {item.body ? <p className="type-small leading-relaxed text-muted">{item.body}</p> : null}
        </div>
      );
    case "list":
      return (
        <div className="flex items-start gap-3 border-b border-border/60 py-2">
          <ItemIcon item={item} shape="plain" />
          <span className="pt-1">
            <Label item={item} />
          </span>
        </div>
      );
    case "outline":
      return (
        <div className={cn("flex items-center gap-2.5 border border-primary/50 py-2 pr-5 pl-2 text-sm", item.body ? "rounded-2xl" : "rounded-full")}>
          <ItemIcon item={item} shape={shape} />
          <Label item={item} />
        </div>
      );
    case "solid":
      return (
        <div className={cn("flex items-center gap-2.5 bg-primary py-2 pr-5 pl-2 text-sm text-primary-foreground", item.body ? "rounded-2xl" : "rounded-full")}>
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
            {(() => {
              const Icon = sectionIcons[item.icon] ?? sectionIcons.check;
              return <Icon aria-hidden className="size-4" />;
            })()}
          </span>
          <Label item={item} onBrand />
        </div>
      );
    default:
      return (
        <div className="flex h-full items-center gap-2.5 rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-[0.8125rem] leading-snug font-medium sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
          <ItemIcon item={item} shape={shape} />
          <Label item={item} />
        </div>
      );
  }
}

/** The proof number: typed in the dashboard, or counted from Shopify orders. */
async function resolveStatValue(stat: FeatureStat, locale: string): Promise<string> {
  if (stat.source !== "shopifyOrders") return stat.value;
  const count = await getOrdersCount();
  // No access or Shopify unreachable: the typed number stands in.
  if (count === null) return stat.value;
  const total = (stat.baseline ?? 0) + count;
  // "0 orders" is never shown.
  return total <= 0 ? stat.value : statFromCount(total, stat.roundDown ?? "100", locale, stat.plus);
}

async function Stat({ stat, centered }: { stat: FeatureStat; centered: boolean }) {
  const locale = getSiteConfig().store.locale.language;
  const value = await resolveStatValue(stat, locale);
  if (!value.trim()) return null;
  const hasSide = stat.label || stat.title || stat.body;
  // The "+" (or other symbol) sits small and raised in the brand colour, like a footnote mark.
  const affix = "mt-[0.08em] text-[0.45em] text-highlight";

  return (
    <div className={cn("mt-12 flex flex-col gap-5 sm:mt-16 sm:flex-row sm:items-center sm:gap-10", centered && "items-center text-center sm:justify-center sm:text-left")}>
      <div className={cn("flex shrink-0 flex-col sm:items-center", centered ? "items-center" : "items-start")}>
        {stat.countUp ?? true ? (
          <CountUp
            value={value}
            seconds={stat.countSeconds ?? 2.5}
            locale={locale}
            effect={stat.countEffect ?? "speedBlur"}
            blurStrength={stat.blurStrength ?? 1}
            maxBlur={stat.maxBlur ?? 12}
            italic={stat.italicNumber}
            className="type-display leading-none"
            affixClassName={affix}
          />
        ) : (
          <p className={cn("type-display leading-none tabular-nums", stat.italicNumber && "italic")}>{value}</p>
        )}
        {stat.caption ? <p className="type-caption mt-2 font-semibold tracking-[0.2em] text-highlight uppercase">{stat.caption}</p> : null}
      </div>
      {hasSide ? (
        <div className="flex max-w-[36ch] flex-col gap-1.5 max-sm:border-t max-sm:border-primary/50 max-sm:pt-4 sm:border-l sm:border-primary sm:pl-8">
          {stat.label ? <p className="type-caption font-semibold tracking-[0.16em] text-highlight uppercase">{stat.label}</p> : null}
          {stat.title ? (
            <p className="type-h4">
              {stat.title}
              {stat.titleAccent ? <span className="block text-highlight italic">{stat.titleAccent}</span> : null}
            </p>
          ) : null}
          {stat.body ? <p className="type-small text-muted">{stat.body}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A statement band: heading with an accent line, items in one of six styles,
 * and an optional proof number that counts up. Layout `split` puts the heading
 * beside the items.
 */
export function FeatureBand({ config }: { config: FeatureBandSectionConfig }) {
  const items = config.items.filter((item) => item.text.trim());
  const split = config.layout === "split";
  const centered = !split && (config.align ?? "center") === "center";
  const style = config.itemStyle ?? "chips";
  const shape = config.iconShape ?? "circle";
  const columns = config.columns ?? (style === "icons" ? "3" : "2");

  const list = items.length ? (
    <ul
      className={cn(
        columnClasses[columns],
        compactOnPhones.has(style) && columns !== "auto" && "max-sm:grid-cols-2",
        centered && "mx-auto max-w-4xl",
        centered && columns === "auto" && "justify-center",
        style === "icons" && "gap-y-8",
      )}
    >
      {items.map((item, index) => (
        <li key={`${item.text}-${index}`}>
          <FeatureItem item={item} style={style} shape={shape} />
        </li>
      ))}
    </ul>
  ) : null;

  const header = (
    <SectionHeader
      eyebrow={config.eyebrow}
      title={config.title}
      titleAccent={config.titleAccent}
      description={config.description}
      descriptionClassName="mx-auto max-w-[46ch] font-heading text-[1.0625rem] leading-relaxed italic sm:text-xl"
      align={centered ? "center" : "left"}
      className={split ? "mb-0 sm:mb-0" : undefined}
    />
  );

  return (
    <Section config={config}>
      {split ? (
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          {header}
          {list}
        </div>
      ) : (
        <>
          {header}
          {list}
        </>
      )}
      {config.stat?.value || config.stat?.source === "shopifyOrders" ? <Stat stat={config.stat} centered={centered} /> : null}
      {config.cta ? (
        <div className={cn("mt-10 flex", centered && "justify-center")}>
          <Button asChild size="lg">
            <SiteLink href={config.cta.href}>{config.cta.label}</SiteLink>
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
