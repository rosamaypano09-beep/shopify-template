import type { FeaturedProductsSectionConfig } from "@/config";
import { ProductGrid } from "@/components/product/product-grid";
import { logger } from "@/lib/logger";
import { getCollection, type ProductSummary } from "@/lib/shopify";
import { ProductTabs } from "./product-tabs";
import { Section, SectionHeader } from "./section";

async function load(handle: string, limit: number, sectionId: string): Promise<ProductSummary[]> {
  try {
    return (await getCollection(handle, { first: limit }))?.products ?? [];
  } catch (error) {
    logger.error("Featured products could not load", { scope: "sections", sectionId, handle, error });
    return [];
  }
}

/**
 * Products from one collection, optionally with filter tabs that each show
 * another collection. Tabs whose collection is empty are left out; the whole
 * section hides when nothing loads.
 */
export async function FeaturedProducts({ config }: { config: FeaturedProductsSectionConfig }) {
  const tabs = [
    { label: config.allLabel || "All", collectionHandle: config.collectionHandle },
    ...(config.tabs ?? []).filter((tab) => tab.label.trim() && tab.collectionHandle.trim()),
  ];
  const loaded = await Promise.all(tabs.map(async (tab) => ({ ...tab, products: await load(tab.collectionHandle, config.limit, config.id) })));
  const shown = loaded.filter((tab) => tab.products.length);
  if (!shown.length) return null;

  const quickAdd = config.quickAdd ? { label: config.quickAddLabel || "Add to bag" } : null;
  const grid = (products: ProductSummary[]) => <ProductGrid products={products} columns={config.columns ?? "4"} quickAdd={quickAdd} />;

  return (
    <Section config={config}>
      <SectionHeader
        eyebrow={config.eyebrow}
        title={config.title}
        titleAccent={config.titleAccent}
        description={config.description}
        cta={config.cta}
        align={config.align}
      />
      {shown.length > 1 ? (
        <ProductTabs labels={shown.map((tab) => tab.label)} align={config.align === "center" ? "left" : "right"}>
          {shown.map((tab) => (
            <div key={tab.collectionHandle}>{grid(tab.products)}</div>
          ))}
        </ProductTabs>
      ) : (
        grid(shown[0].products)
      )}
    </Section>
  );
}
