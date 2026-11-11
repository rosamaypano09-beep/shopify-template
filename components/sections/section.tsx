import type { CSSProperties, ReactNode } from "react";
import type { CtaConfig, SectionBackground, SectionConfig } from "@/config";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

/**
 * Each band recolours the theme tokens inside it (see .ce-band-* in
 * app/globals.css), so text-muted, borders and buttons stay readable on it.
 */
const backgrounds: Record<SectionBackground, string> = {
  default: "",
  surface: "bg-surface",
  primary: "ce-band-primary",
  secondary: "ce-band-secondary",
  inverse: "ce-band-inverse",
  glow: "ce-band-glow",
};

const spacings = { compact: "py-10 sm:py-12", normal: "py-section", spacious: "py-[calc(var(--ce-space-section)*1.4)]" } as const;

type Style = Pick<SectionConfig, "id" | "background" | "shape" | "spacing" | "backdrop">;

/** The moving background layer, if the section has one. */
function Backdrop({ kind }: { kind: Style["backdrop"] }) {
  if (!kind || kind === "none") return null;
  return (
    <div aria-hidden className={`ce-backdrop ce-backdrop-${kind}`}>
      {kind === "orbs" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
    </div>
  );
}

interface SectionProps {
  config: Style;
  /** Tighter vertical padding for slim bands such as the benefits row, unless the editor chose a spacing. */
  compact?: boolean;
  children: ReactNode;
  className?: string;
  /** Colours chosen in the dashboard (custom hex values from config). */
  style?: CSSProperties;
  /** Content runs edge to edge instead of inside the page width. */
  fullBleed?: boolean;
}

/** Shared frame for homepage sections: colour band, shape, spacing and page width. */
export function Section({ config, compact, children, className, style, fullBleed }: SectionProps) {
  const background = config.background ?? "default";
  const shape = config.shape ?? "flat";
  const spacing = spacings[config.spacing ?? (compact ? "compact" : "normal")];
  const band = cn(backgrounds[background], "text-foreground");
  const moving = config.backdrop && config.backdrop !== "none";

  if (shape === "card") {
    return (
      <section id={config.id} className={cn(spacing, "px-gutter")}>
        <div className={cn("relative isolate mx-auto max-w-[calc(var(--ce-space-container)+var(--ce-space-gutter)*2)] overflow-hidden rounded-[2rem]", band, background === "default" && "bg-surface", className)}>
          <Backdrop kind={config.backdrop} />
          <div className={cn("container-site", spacings[config.spacing ?? "normal"])}>{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={config.id}
      style={style}
      className={cn(
        band,
        spacing,
        // Arched top and bottom edges: wide elliptical corners.
        shape === "curved" && "relative overflow-hidden [border-radius:50%/clamp(1.5rem,5vw,4.5rem)] py-[calc(var(--ce-space-section)*1.25)]",
        moving && "relative isolate overflow-hidden",
        className,
      )}
    >
      <Backdrop kind={config.backdrop} />
      {fullBleed ? children : <div className="container-site">{children}</div>}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  titleAccent?: string;
  eyebrow?: string;
  description?: string;
  cta?: CtaConfig;
  align?: "left" | "center";
  className?: string;
  /** Extra classes for the description, for sections that style it differently. */
  descriptionClassName?: string;
}

/** Eyebrow, heading (with an optional accent line), description and an optional link. */
export function SectionHeader({ title, titleAccent, eyebrow, description, cta, align = "left", className, descriptionClassName }: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-12",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between md:gap-10",
        className,
      )}
    >
      <div className={cn("flex max-w-[44rem] flex-col gap-3", centered && "items-center")}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="type-h2">
          {title}
          {titleAccent ? <span className="block text-highlight italic">{titleAccent}</span> : null}
        </h2>
        {description ? <p className={cn("type-body-lg text-pretty text-muted", descriptionClassName)}>{description}</p> : null}
      </div>
      {cta ? (
        <SiteLink
          href={cta.href}
          className="inline-flex min-h-11 shrink-0 items-center font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2"
        >
          {cta.label}
        </SiteLink>
      ) : null}
    </div>
  );
}

/** The small pill above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "type-caption inline-flex w-fit items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-semibold tracking-[0.16em] text-highlight uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
