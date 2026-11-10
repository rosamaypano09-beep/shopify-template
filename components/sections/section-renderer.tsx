import type { SectionConfig } from "@/config";
import { Benefits } from "./benefits";
import { BrandStatement } from "./brand-statement";
import { CollectionGrid } from "./collection-grid";
import { Faq } from "./faq";
import { FeaturedProducts } from "./featured-products";
import { Hero } from "./hero";
import { ImageText } from "./image-text";
import { LogoMarquee } from "./logo-marquee";
import { Newsletter } from "./newsletter";
import { Testimonials } from "./testimonials";

/**
 * Turns section config into components. To add a section type:
 *   1. add its config interface to config/types.ts (and the SectionConfig union)
 *   2. build the component in this folder
 *   3. add a case below
 * TypeScript flags any section type that has no case here.
 */
function renderSection(section: SectionConfig) {
  switch (section.type) {
    case "hero":
      return <Hero config={section} />;
    case "benefits":
      return <Benefits config={section} />;
    case "collectionGrid":
      return <CollectionGrid config={section} />;
    case "featuredProducts":
      return <FeaturedProducts config={section} />;
    case "brandStatement":
      return <BrandStatement config={section} />;
    case "newsletter":
      return <Newsletter config={section} />;
    case "faq":
      return <Faq config={section} />;
    case "testimonials":
      return <Testimonials config={section} />;
    case "logoMarquee":
      return <LogoMarquee config={section} />;
    case "imageText":
      return <ImageText config={section} />;
    default: {
      const unhandled: never = section;
      return unhandled;
    }
  }
}

export function SectionRenderer({ sections }: { sections: SectionConfig[] }) {
  return (
    <>
      {sections
        .filter((section) => section.enabled)
        .map((section) => (
          <div key={section.id} className="contents">
            {renderSection(section)}
          </div>
        ))}
    </>
  );
}
