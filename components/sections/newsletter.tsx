import type { NewsletterSectionConfig } from "@/config";
import { getSiteConfig } from "@/config";
import { NewsletterForm } from "@/components/forms/forms";
import { formMode } from "@/lib/forms/delivery";
import { Section } from "./section";

/** Email sign-up. Hidden unless the feature is on and submissions have somewhere to go. */
export function Newsletter({ config }: { config: NewsletterSectionConfig }) {
  if (!getSiteConfig().features.newsletter || formMode("newsletter") === "off") return null;

  return (
    <Section id={config.id} background={config.background}>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-3">
          <h2 className="type-h2">{config.title}</h2>
          {config.description ? <p className="type-body-lg opacity-75">{config.description}</p> : null}
        </div>
        <NewsletterForm onDark={config.background === "primary"} />
      </div>
    </Section>
  );
}
