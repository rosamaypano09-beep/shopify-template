import type { FaqItem, FaqSectionConfig } from "@/config";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import { Eyebrow, SectionHeader, Section } from "./section";

/** Questions and answers as an accordion. Shared by the homepage section and the FAQ page. */
export function FaqList({ items, idPrefix }: { items: FaqItem[]; idPrefix: string }) {
  return (
    <Accordion type="multiple" className="border-t border-border">
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`${idPrefix}-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>
            <p className="max-w-[68ch] whitespace-pre-line text-muted">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function Faq({ config }: { config: FaqSectionConfig }) {
  if (!config.items.length) return null;

  if (config.layout === "split") {
    return (
      <Section config={config}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="flex flex-col items-start gap-4 lg:sticky lg:top-[calc(var(--ce-header-height)+2rem)] lg:self-start">
            {config.eyebrow ? <Eyebrow>{config.eyebrow}</Eyebrow> : null}
            <h2 className="type-h1">
              {config.title}
              {config.titleAccent ? <span className="block text-highlight italic">{config.titleAccent}</span> : null}
            </h2>
            {config.description ? <p className="type-body-lg text-muted">{config.description}</p> : null}
            {config.cta ? (
              <Button asChild variant="outline" className="mt-2">
                <SiteLink href={config.cta.href}>{config.cta.label}</SiteLink>
              </Button>
            ) : null}
          </div>
          <FaqList items={config.items} idPrefix={config.id} />
        </div>
        <JsonLd data={faqJsonLd(config.items)} />
      </Section>
    );
  }

  return (
    <Section config={config}>
      <SectionHeader eyebrow={config.eyebrow} title={config.title} titleAccent={config.titleAccent} description={config.description} cta={config.cta} align={config.align} />
      <div className={config.align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"}>
        <FaqList items={config.items} idPrefix={config.id} />
      </div>
      <JsonLd data={faqJsonLd(config.items)} />
    </Section>
  );
}
