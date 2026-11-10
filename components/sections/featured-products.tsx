import type { FeaturedProductsSectionConfig } from "@/config";
import { ProductGrid } from "@/components/product/product-grid";
import { logger } from "@/lib/logger";
import { getCollection, type ProductSummary } from "@/lib/shopify";
import { Section, SectionHeader } from "./section";

/** The first products of one collection. Hidden when the collection is empty or missing. */
export async function FeaturedProducts({ config }: { config: FeaturedProductsSectionConfig }) {
  let products: ProductSummary[];
  try {
    const collection = await getCollection(config.collectionHandle, { first: config.limit });
    products = collection?.products ?? [];
  } catch (error) {
    logger.error("Featured products could not load", { scope: "sections", sectionId: config.id, error });
    return null;
  }

  if (!products.length) return null;

  return (
    <Section id={config.id} background={config.background}>
      <SectionHeader title={config.title} description={config.description} cta={config.cta} />
      <ProductGrid products={products} />
    </Section>
  );
}
