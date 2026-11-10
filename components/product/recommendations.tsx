import { logger } from "@/lib/logger";
import { getRecommendations, type ProductSummary } from "@/lib/shopify";
import { ProductGrid } from "./product-grid";

/** Shopify's related products. Renders nothing when Shopify has none, or cannot be reached. */
export async function Recommendations({ productId }: { productId: string }) {
  let products: ProductSummary[];
  try {
    products = (await getRecommendations(productId)).slice(0, 4);
  } catch (error) {
    logger.error("Recommendations could not load", { scope: "recommendations", error });
    return null;
  }
  if (!products.length) return null;

  return (
    <section aria-labelledby="recommendations" className="container-site border-t border-border py-section">
      <h2 id="recommendations" className="type-h2 mb-8 sm:mb-12">
        You may also like
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
