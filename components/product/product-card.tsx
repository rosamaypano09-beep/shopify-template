import { getSiteConfig } from "@/config";
import { ProductCardView, type ProductCardLook } from "./product-card-view";

export function getCardLook(): ProductCardLook {
  const { theme, store, features } = getSiteConfig();
  return {
    cardStyle: theme.variants.productCard,
    imageRatio: theme.variants.productImageRatio,
    animation: theme.variants.animation,
    locale: store.locale.language,
    wishlist: features.wishlist,
    quickView: features.quickView,
    reviews: features.reviews,
  };
}

/** Server-side card: reads its look from the site configuration. */
export function ProductCard(props: Omit<Parameters<typeof ProductCardView>[0], "look">) {
  return <ProductCardView {...props} look={getCardLook()} />;
}
