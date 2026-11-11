/**
 * The Shopify layer. Pages and components import from here only:
 *
 *   import { getProduct, getCollection } from "@/lib/shopify";
 *
 * Cart operations are reached through the server actions in lib/cart/actions.ts.
 */
export { getProduct, getProducts } from "./products";
export { getCollection, getCollections } from "./collections";
export { getPolicies } from "./policies";
export { getArticle, getBlog, getMenu, getPage, listContent, readingMinutes } from "./content";
export { getRecommendations } from "./recommendations";
export { searchProducts, predictiveSearch, cleanQuery } from "./search";
export { ShopifyError } from "./errors";
export { canCountOrders, getOrderCountStatus, getOrdersCount, type OrderCountStatus } from "./admin";
export type * from "./types";
