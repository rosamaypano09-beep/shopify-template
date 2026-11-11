/**
 * The shapes the storefront UI works with. They are deliberately smaller and
 * flatter than raw Storefront API responses (no edges/nodes), so components
 * never depend on GraphQL details and the mock catalog can satisfy them too.
 */

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopImage | null;
}

/** What a product card needs. Returned by list queries. */
export interface ProductSummary {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  availableForSale: boolean;
  tags: string[];
  featuredImage: ShopImage | null;
  /** Shown on hover when present. */
  secondaryImage: ShopImage | null;
  price: Money;
  /** True when variants have different prices, so cards can say "From". */
  hasPriceRange: boolean;
  compareAtPrice: Money | null;
  /** Average rating from the store's review app, when it publishes one. */
  rating: ProductRating | null;
  /** The variant a card can add straight to the cart: set only when the product has exactly one, and it is for sale. */
  quickAddVariantId: string | null;
}

export interface ProductRating {
  /** Average, on a 0 to 5 scale. */
  value: number;
  count: number;
}

export interface Product extends ProductSummary {
  description: string;
  productType: string;
  images: ShopImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  seo: { title: string | null; description: string | null };
  updatedAt: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopImage | null;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

/** One selectable value of a filter, e.g. "In stock". `input` is what Shopify expects back. */
export interface ProductFilterValue {
  id: string;
  label: string;
  count: number;
  /** JSON string understood by the Storefront API `filters` argument. */
  input: string;
}

export interface ProductFilterGroup {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: ProductFilterValue[];
}

export interface CollectionWithProducts extends Collection {
  products: ProductSummary[];
  pageInfo: PageInfo;
  /** Filters the merchant enabled in Shopify (Search & Discovery app). Empty when none. */
  filters: ProductFilterGroup[];
}

export type ProductSort = "featured" | "best-selling" | "newest" | "price-asc" | "price-desc";

export interface ProductListOptions {
  first?: number;
  after?: string | null;
  sort?: ProductSort;
  /** `input` strings of the selected filter values. */
  filters?: string[];
}

export type SearchSort = "relevance" | "price-asc" | "price-desc";

export interface SearchOptions {
  first?: number;
  after?: string | null;
  sort?: SearchSort;
}

export interface SearchResult {
  products: ProductSummary[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PredictiveSearchResult {
  products: ProductSummary[];
  collections: Pick<Collection, "id" | "handle" | "title">[];
  /** Suggested search terms. */
  suggestions: string[];
}

/** Everything the catalog pages need. Implemented by live.ts and mock/source.ts. */
export interface CatalogSource {
  getProduct(handle: string): Promise<Product | null>;
  getProducts(options?: ProductListOptions): Promise<{ products: ProductSummary[]; pageInfo: PageInfo }>;
  getCollection(handle: string, options?: ProductListOptions): Promise<CollectionWithProducts | null>;
  getCollections(first?: number): Promise<Collection[]>;
  /** Legal policies written in Shopify admin. Empty when none are published. */
  getPolicies(): Promise<ShopPolicy[]>;
  /** Related products chosen by Shopify. Empty when it has none. */
  getRecommendations(productId: string): Promise<ProductSummary[]>;
  search(query: string, options?: SearchOptions): Promise<SearchResult>;
  predictiveSearch(query: string): Promise<PredictiveSearchResult>;
  /** A blog and a page of its newest articles, or null when it does not exist. */
  /** `tag` keeps only articles with that tag. */
  getBlog(handle: string, options?: BlogOptions): Promise<Blog | null>;
  getArticle(blogHandle: string, articleHandle: string): Promise<Article | null>;
  /** A page written in Shopify admin (Online Store > Pages). */
  getPage(handle: string): Promise<ShopPage | null>;
  /** A menu from Shopify admin (Online Store > Navigation). Empty when it does not exist. */
  getMenu(handle: string): Promise<ShopMenuItem[]>;
  /** Titles and handles of published pages and blogs, for link pickers. */
  listContent(): Promise<ContentIndex>;
}

export interface BlogOptions {
  first?: number;
  after?: string | null;
  tag?: string | null;
}

export interface ContentIndex {
  pages: { handle: string; title: string }[];
  blogs: { handle: string; title: string }[];
  articles: { handle: string; title: string; blogHandle: string }[];
}

export interface ShopPolicy {
  handle: string;
  title: string;
  /** HTML written by the merchant. Always sanitized before display. */
  body: string;
}

/* ---------- Content (Online Store > Blog posts, Pages, Navigation) ---------- */

export interface ArticleSummary {
  id: string;
  handle: string;
  /** Handle of the blog the article belongs to, for building its URL. */
  blogHandle: string;
  title: string;
  /** Plain text. */
  excerpt: string;
  publishedAt: string;
  image: ShopImage | null;
  author: string | null;
  tags: string[];
}

export interface Article extends ArticleSummary {
  /** HTML written by the merchant. Always sanitized before display. */
  contentHtml: string;
  /** The Excerpt field exactly as written in Shopify, without the fallback. Shown under the title. */
  standfirst: string;
  seo: { title: string | null; description: string | null };
}

export interface Blog {
  id: string;
  handle: string;
  title: string;
  seo: { title: string | null; description: string | null };
  articles: ArticleSummary[];
  pageInfo: PageInfo;
}

export interface ShopPage {
  id: string;
  handle: string;
  title: string;
  /** HTML written by the merchant. Always sanitized before display. */
  body: string;
  bodySummary: string;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
}

/** One entry of a Shopify navigation menu, with its URL already turned into a storefront path. */
export interface ShopMenuItem {
  title: string;
  href: string;
  external: boolean;
  items: ShopMenuItem[];
}

/* ---------- Cart ---------- */

export interface CartLine {
  id: string;
  quantity: number;
  merchandiseId: string;
  productHandle: string;
  productTitle: string;
  /** Empty for single-variant products ("Default Title" is hidden). */
  variantTitle: string;
  image: ShopImage | null;
  unitPrice: Money;
  compareAtUnitPrice: Money | null;
  totalPrice: Money;
  availableForSale: boolean;
  /** Notes stored on the line, for example the flavours chosen for a bundle. They travel to the order. */
  attributes: CartLineAttribute[];
}

export interface CartLineAttribute {
  key: string;
  value: string;
}

export interface Cart {
  id: string;
  /** Shopify's hosted checkout for this cart. Null only in the demo catalog. */
  checkoutUrl: string | null;
  totalQuantity: number;
  lines: CartLine[];
  /** Before shipping, taxes and cart-level discounts. */
  subtotal: Money;
  /** What Shopify currently expects the customer to pay, before shipping. */
  total: Money;
  discountCodes: { code: string; applicable: boolean }[];
  /** Notes on the whole order, for example the chosen pickup date and time. */
  attributes: CartLineAttribute[];
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: CartLineAttribute[];
}

/** Cart operations. Implemented by cart-live.ts and mock/cart.ts. */
export interface CartSource {
  getCart(cartId: string): Promise<Cart | null>;
  createCart(lines: CartLineInput[]): Promise<Cart>;
  addLines(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart>;
  removeLines(cartId: string, lineIds: string[]): Promise<Cart>;
  updateDiscountCodes(cartId: string, codes: string[]): Promise<Cart>;
  /** Replaces the order notes. They reach the order (Shopify admin: Additional details). */
  updateAttributes(cartId: string, attributes: CartLineAttribute[]): Promise<Cart>;
}
