import type { FaqItem, FaqSectionConfig } from "@/config";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeader, Section } from "./section";

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
  return (
    <Section id={config.id} background={config.background}>
      <SectionHeader title={config.title} cta={config.cta} />
      <div className="max-w-3xl">
        <FaqList items={config.items} idPrefix={config.id} />
      </div>
      <JsonLd data={faqJsonLd(config.items)} />
    </Section>
  );
}
