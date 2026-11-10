import type { ReactNode } from "react";
import type { CtaConfig, SectionConfig } from "@/config";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

const backgrounds: Record<NonNullable<SectionConfig["background"]>, string> = {
  default: "",
  surface: "bg-surface",
  primary: "bg-primary text-primary-foreground",
};

interface SectionProps {
  id: string;
  background?: SectionConfig["background"];
  /** Tighter vertical padding for slim bands such as the benefits row. */
  compact?: boolean;
  children: ReactNode;
  className?: string;
}

/** Shared frame for homepage sections: spacing, background and page width. */
export function Section({ id, background = "default", compact, children, className }: SectionProps) {
  return (
    <section id={id} className={cn(backgrounds[background], compact ? "py-10 sm:py-12" : "py-section", className)}>
      <div className="container-site">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  cta?: CtaConfig;
}

export function SectionHeader({ title, description, cta }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="flex max-w-[44rem] flex-col gap-3">
        <h2 className="type-h2">{title}</h2>
        {description ? <p className="type-body-lg opacity-75">{description}</p> : null}
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
