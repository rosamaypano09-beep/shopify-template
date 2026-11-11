import { Diamond, Slash, Sparkle, Star } from "lucide-react";
import type { CSSProperties } from "react";
import type { MarqueeFont, MarqueeSectionConfig } from "@/config";
import { cn } from "@/lib/utils";
import { sectionIcons } from "./icons";
import { Section } from "./section";

type Item = MarqueeSectionConfig["items"][number];

const fonts: Record<MarqueeFont, string> = {
  heading: "var(--ce-font-heading)",
  body: "var(--ce-font-body)",
  playfair: "var(--ce-font-playfair)",
  cormorant: "var(--ce-font-cormorant)",
  bricolage: "var(--ce-font-bricolage)",
  jost: "var(--ce-font-jost)",
  schibsted: "var(--ce-font-schibsted)",
  figtree: "var(--ce-font-figtree)",
};

const sizes = {
  sm: "text-base",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-5xl sm:text-6xl",
  display: "text-[clamp(3rem,1.5rem+7vw,8rem)] leading-none",
} as const;

/** Seconds for one full pass. Longer lists get more time so the reading speed stays the same. */
const pace = { slow: 7, normal: 4.5, fast: 2.5 } as const;

function Separator({ kind, item }: { kind: MarqueeSectionConfig["separator"]; item: Item }) {
  const icon = "size-[0.55em] shrink-0";
  switch (kind) {
    case "dot":
      return <span className="size-[0.22em] shrink-0 rounded-full bg-current" />;
    case "star":
      return <Star className={cn(icon, "fill-current")} />;
    case "sparkle":
      return <Sparkle className={cn(icon, "fill-current")} />;
    case "diamond":
      return <Diamond className={cn(icon, "fill-current")} />;
    case "slash":
      return <Slash className={icon} />;
    case "icon": {
      const Icon = item.icon ? sectionIcons[item.icon] : null;
      return Icon ? <Icon className={icon} /> : <span className="size-[0.22em] shrink-0 rounded-full bg-current" />;
    }
    default:
      return null;
  }
}

function Row({ config, items, reverse }: { config: MarqueeSectionConfig; items: Item[]; reverse: boolean }) {
  const outline = (index: number) => config.textStyle === "outline" || (config.textStyle === "alternate" && index % 2 === 1);
  const track = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      className="ce-ticker-track flex shrink-0 items-center whitespace-nowrap"
    >
      {/* Spacing sits after every word (separator included), so the seam between copies matches the rest. */}
      {items.map((item, index) => (
        <li key={`${item.text}-${index}`} className="flex items-center gap-[0.55em] pr-[0.55em]">
          <span className={cn(outline(index) && "ce-ticker-outline")}>{item.text}</span>
          {config.separator !== "none" ? (
            <span aria-hidden className="inline-flex" style={{ color: "var(--ce-ticker-accent)" }}>
              <Separator kind={config.separator} item={item} />
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={cn("ce-ticker flex overflow-hidden", sizes[config.size])}
      style={{ "--ce-ticker-direction": reverse ? "reverse" : "normal" } as CSSProperties}
    >
      {track(false)}
      {/* A second copy makes the loop seamless. Hidden from screen readers and the keyboard. */}
      <div className="contents" inert>
        {track(true)}
      </div>
    </div>
  );
}

/**
 * Brand words scrolling across the page. Font, weight, size, colours, speed,
 * direction, a second row and a tilted ribbon are set per section. It pauses
 * on hover, and wraps to stand still for visitors who ask for less motion.
 */
export function Marquee({ config }: { config: MarqueeSectionConfig }) {
  const items = config.items.filter((item) => item.text.trim());
  if (!items.length) return null;

  const style = {
    "--ce-ticker-duration": `${Math.max(12, items.length * pace[config.speed] * (config.size === "display" ? 2 : 1))}s`,
    "--ce-ticker-accent": config.accentColor || "var(--color-highlight)",
    "--ce-ticker-text": config.textColor || "currentColor",
    ...(config.backgroundColor ? { backgroundColor: config.backgroundColor } : {}),
    ...(config.textColor ? { color: config.textColor } : {}),
  } as CSSProperties;
  const reverse = config.direction === "right";

  const band = (
    <div
      className={cn("flex flex-col gap-3 py-1", config.borders && "border-y border-current/25 py-5", config.tilt && "-mx-[5%] w-[110%] -rotate-2")}
      style={{
        fontFamily: fonts[config.font],
        fontWeight: Number(config.weight),
        fontStyle: config.italic ? "italic" : undefined,
        textTransform: config.uppercase ? "uppercase" : undefined,
        letterSpacing: config.uppercase ? "0.04em" : undefined,
        ...(config.tilt && config.backgroundColor ? { backgroundColor: config.backgroundColor } : {}),
      }}
    >
      <Row config={config} items={items} reverse={reverse} />
      {config.doubleRow ? <Row config={config} items={[...items].reverse()} reverse={!reverse} /> : null}
    </div>
  );

  return (
    <Section
      config={config}
      compact
      fullBleed
      style={style}
      className={cn("overflow-hidden", !config.spacing && "py-6 sm:py-8", config.tilt && "py-12 sm:py-16")}
    >
      {/* The words, once, for screen readers. */}
      <p className="sr-only">{items.map((item) => item.text).join(", ")}</p>
      <div aria-hidden>{band}</div>
    </Section>
  );
}
