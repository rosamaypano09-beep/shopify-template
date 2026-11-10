import type { FeaturesConfig } from "./types";

/**
 * Feature switches. Turn off anything a client does not need: a feature
 * that is off renders nothing.
 */
export const featuresConfig: FeaturesConfig = {
  cartDrawer: true,
  wishlist: true,
  reviews: true,
  quickView: true,
  recentlyViewed: true,
  compare: false,
  newsletter: true,
  testimonials: false,
  instagram: false,
  predictiveSearch: true,
  customerAccounts: true,
  stickyAddToCart: true,
  mobileBottomNav: true,
};
