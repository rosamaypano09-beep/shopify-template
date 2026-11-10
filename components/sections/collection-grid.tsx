import type { CollectionGridSectionConfig } from "@/config";
import { CollectionCard } from "@/components/collection/collection-card";
import { logger } from "@/lib/logger";
import { getCollections, type Collection } from "@/lib/shopify";
import { Section, SectionHeader } from "./section";

/** Tiles for the configured collections, in the configured order. */
export async function CollectionGrid({ config }: { config: CollectionGridSectionConfig }) {
  let collections: Collection[];
  try {
    const all = await getCollections();
    collections = config.handles
      .map((handle) => all.find((collection) => collection.handle === handle))
      .filter((collection): collection is Collection => Boolean(collection));
  } catch (error) {
    // A Shopify hiccup hides this section; it never takes the homepage down.
    logger.error("Collection grid could not load", { scope: "sections", sectionId: config.id, error });
    return null;
  }

  if (!collections.length) return null;

  return (
    <Section id={config.id} background={config.background}>
      <SectionHeader title={config.title} description={config.description} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
