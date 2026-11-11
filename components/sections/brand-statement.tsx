import type { BrandStatementSectionConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import { Section } from "./section";

export function BrandStatement({ config }: { config: BrandStatementSectionConfig }) {
  if (!config.text) return null;
  const onPrimary = config.background === "primary";

  return (
    <Section config={config}>
      <div className="flex max-w-[60rem] flex-col items-start gap-8">
        <p className="type-h1 max-sm:text-[1.875rem] max-sm:leading-[1.12]">{config.text}</p>
        {config.attribution ? <p className="type-body opacity-75">{config.attribution}</p> : null}
        {config.cta ? (
          <Button asChild size="lg" variant={onPrimary ? "accent" : "primary"}>
            <SiteLink href={config.cta.href}>{config.cta.label}</SiteLink>
          </Button>
        ) : null}
      </div>
    </Section>
  );
}
