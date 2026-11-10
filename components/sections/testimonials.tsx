import type { TestimonialsSectionConfig } from "@/config";
import { Section, SectionHeader } from "./section";

/** Customer quotes. Hidden when there are none; never filled with invented ones. */
export function Testimonials({ config }: { config: TestimonialsSectionConfig }) {
  const items = config.items.filter((item) => item.quote.trim() && item.name.trim());
  if (!items.length) return null;

  return (
    <Section id={config.id} background={config.background}>
      <SectionHeader title={config.title} />
      <ul className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.name + item.quote.slice(0, 24)}>
            <figure className="flex h-full flex-col gap-5 border-t-2 border-current pt-5">
              <blockquote className="type-body-lg flex-1">
                <p>&ldquo;{item.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="type-small">
                <span className="font-semibold">{item.name}</span>
                {item.detail ? <span className="opacity-75">, {item.detail}</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
