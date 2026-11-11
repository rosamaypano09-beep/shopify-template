import type { BenefitsSectionConfig } from "@/config";
import { sectionIcons as icons } from "./icons";
import { Section } from "./section";

/** A short row of promises. Only list what the client really offers. */
export function Benefits({ config }: { config: BenefitsSectionConfig }) {
  if (!config.items.length) return null;

  return (
    <Section config={config} compact>
      {config.title ? <h2 className="type-h3 mb-8">{config.title}</h2> : null}
      <ul className="grid gap-x-10 gap-y-8 border-y border-border py-8 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
        {config.items.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li key={item.title} className="flex gap-4">
              <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-primary" strokeWidth={1.75} />
              <div className="flex flex-col gap-1">
                <h3 className="type-h4">{item.title}</h3>
                <p className="type-small max-w-[38ch] text-muted">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
