import type { CSSProperties } from "react";
import type { HighlightsSectionConfig, MarqueeFont } from "@/config";
import { cn } from "@/lib/utils";
import { CurvedText } from "./curved-text";
import { Section } from "./section";

const FONTS: Record<MarqueeFont, string> = {
  heading: "var(--ce-font-heading)",
  body: "var(--ce-font-body)",
  playfair: "var(--ce-font-playfair)",
  cormorant: "var(--ce-font-cormorant)",
  bricolage: "var(--ce-font-bricolage)",
  jost: "var(--ce-font-jost)",
  schibsted: "var(--ce-font-schibsted)",
  figtree: "var(--ce-font-figtree)",
};

const GLYPHS = { dot: "•", sparkle: "✦", star: "★", diamond: "◆" } as const;
const MARQUEE_SIZES = { sm: "text-sm sm:text-base", md: "text-lg sm:text-2xl", lg: "text-2xl sm:text-4xl" } as const;
/** In drawing units: the curve is 220 units tall and about 150px on screen, so md is about 31px. */
const CURVE_SIZES = { sm: 32, md: 44, lg: 58 } as const;
/** Seconds per phrase for the straight marquee. */
const PACE = { slow: 6, normal: 4, fast: 2.5 } as const;

/**
 * A strip of short facts, usually right under the hero: still in one line,
 * scrolling sideways, or flowing along a curve. Each fact is separated by a
 * small mark in the brand colour.
 */
export function Highlights({ config }: { config: HighlightsSectionConfig }) {
  const items = config.items.filter((item) => item.text.trim());
  if (!items.length) return null;
  const layout = config.layout ?? "row";
  const separator = GLYPHS[config.separator ?? (layout === "row" ? "dot" : "sparkle")];
  const font = FONTS[config.font ?? (layout === "row" ? "body" : "heading")];
  const uppercase = config.uppercase ?? true;
  const size = config.size ?? "md";
  const plainBand = (config.background ?? "default") === "default";

  if (layout === "curve") {
    const overlap = config.overlap ?? false;
    return (
      <Section
        // Overlapping: no band of its own, so the sections above and below show through around the ribbon.
        config={overlap ? { ...config, background: "default", shape: "flat", backdrop: "none" } : config}
        compact
        fullBleed
        className={cn(
          overlap
            ? // Lifted above its neighbours and pulled into them by about a third of its height each way.
              "pointer-events-none relative z-20 -my-6 py-0 sm:-my-[clamp(2.25rem,1.5rem+2vw,3.5rem)] sm:py-0"
            : cn("[overflow-x:clip]", !config.spacing && "py-3 sm:py-5"),
        )}
      >
        <CurvedText
          parts={items.map((item) => ({ text: item.text, separator }))}
          curve={config.curve ?? "wave"}
          straightOnPhones={config.straightOnPhones ?? true}
          speed={config.speed ?? "normal"}
          direction={config.direction ?? "left"}
          fontSize={CURVE_SIZES[size]}
          fontFamily={font}
          fontWeight={config.font === "body" || config.font === "figtree" ? 600 : 700}
          italic={config.italic}
          uppercase={uppercase}
          ribbon={config.ribbon ?? (overlap ? "brand" : "none")}
          label={items.map((item) => item.text).join(", ")}
        />
      </Section>
    );
  }

  if (layout === "marquee") {
    const track = (copy: boolean) => (
      <ul aria-hidden={copy || undefined} className="ce-ticker-track flex shrink-0 items-center whitespace-nowrap">
        {items.map((item, index) => (
          <li key={`${item.text}-${index}`} className="flex items-center gap-[0.9em] pr-[0.9em]">
            <span>{item.text}</span>
            <span aria-hidden className="text-[0.7em] text-highlight">
              {separator}
            </span>
          </li>
        ))}
      </ul>
    );
    return (
      <Section
        config={config}
        compact
        fullBleed
        className={cn("overflow-hidden", !config.spacing && "py-4 sm:py-5", plainBand && "border-y border-border")}
        style={{ "--ce-ticker-duration": `${Math.max(14, items.length * PACE[config.speed ?? "normal"] * 2)}s` } as CSSProperties}
      >
        <p className="sr-only">{items.map((item) => item.text).join(", ")}</p>
        <div
          aria-hidden
          className={cn("ce-ticker flex overflow-hidden", MARQUEE_SIZES[size], "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]")}
          style={
            {
              "--ce-ticker-direction": config.direction === "right" ? "reverse" : "normal",
              fontFamily: font,
              fontWeight: 600,
              fontStyle: config.italic ? "italic" : undefined,
              textTransform: uppercase ? "uppercase" : undefined,
              letterSpacing: uppercase ? "0.12em" : undefined,
            } as CSSProperties
          }
        >
          {track(false)}
          <div className="contents" inert>
            {track(true)}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section config={config} compact className={cn(!config.spacing && "py-5 sm:py-6", plainBand && "border-y border-border")}>
      <ul
        className={cn(
          "type-caption flex flex-wrap items-center gap-x-8 gap-y-3 font-semibold text-muted",
          uppercase && "tracking-[0.14em] uppercase",
          config.align === "left" ? "justify-start" : "justify-center lg:justify-between",
        )}
        style={{ fontFamily: config.font ? font : undefined, fontStyle: config.italic ? "italic" : undefined }}
      >
        {items.map((item, index) => (
          <li key={`${item.text}-${index}`} className="flex items-center gap-3">
            <span aria-hidden className="text-[0.8em] text-highlight">
              {separator}
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </Section>
  );
}
