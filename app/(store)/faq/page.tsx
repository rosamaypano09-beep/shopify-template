import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/config";
import { FaqList, faqJsonLd } from "@/components/sections/faq";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const { faq } = getSiteConfig().pages;
  return pageMetadata({ title: faq.title, description: faq.intro, path: "/faq" });
}

export default function FaqPage() {
  const { faq } = getSiteConfig().pages;
  if (!faq.enabled) notFound();
  const all = faq.groups.flatMap((group) => group.items);

  return (
    <div className="container-site py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "FAQ", href: "/faq" },
        ]}
      />
      <header className="mt-4 mb-10 flex max-w-[52rem] flex-col gap-4 sm:mb-14">
        <h1 className="type-h1">{faq.title}</h1>
        {faq.intro ? <p className="type-body-lg text-muted">{faq.intro}</p> : null}
      </header>
      <div className="flex max-w-3xl flex-col gap-12">
        {faq.groups.map((group, index) => (
          <section key={group.title} aria-labelledby={`faq-group-${index}`}>
            <h2 id={`faq-group-${index}`} className="type-h3 mb-4">
              {group.title}
            </h2>
            <FaqList items={group.items} idPrefix={`group-${index}`} />
          </section>
        ))}
      </div>
      {all.length ? <JsonLd data={faqJsonLd(all)} /> : null}
    </div>
  );
}
