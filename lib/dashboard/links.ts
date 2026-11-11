import "server-only";
import { logger } from "@/lib/logger";
import { getCollections, getPolicies, getProducts, listContent } from "@/lib/shopify";
import { assertAdmin } from "./session";

export interface LinkSuggestion {
  label: string;
  href: string;
  group: string;
}

/** Built-in storefront routes. Always valid, whatever is in Shopify. */
const STORE_PAGES: LinkSuggestion[] = [
  { label: "Home", href: "/", group: "Store pages" },
  { label: "All collections", href: "/collections", group: "Store pages" },
  { label: "Search", href: "/search", group: "Store pages" },
  { label: "About", href: "/about", group: "Store pages" },
  { label: "FAQ", href: "/faq", group: "Store pages" },
  { label: "Contact", href: "/contact", group: "Store pages" },
  { label: "Wishlist", href: "/wishlist", group: "Store pages" },
  { label: "Cart", href: "/cart", group: "Store pages" },
];

async function safely<T>(what: string, load: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    logger.error(`Link suggestions: ${what} could not load`, { scope: "dashboard", error });
    return empty;
  }
}

/** Every link the store can point to: built-in pages plus what exists in Shopify right now. */
export async function getLinkSuggestions(): Promise<LinkSuggestion[]> {
  await assertAdmin();
  const [collections, products, content, policies] = await Promise.all([
    safely("collections", () => getCollections(), []),
    safely("products", async () => (await getProducts({ first: 100 })).products, []),
    safely("pages and blogs", () => listContent(), { pages: [], blogs: [], articles: [] }),
    safely("policies", () => getPolicies(), []),
  ]);
  return [
    ...STORE_PAGES,
    ...collections.map((c) => ({ label: c.title, href: `/collections/${c.handle}`, group: "Collections" })),
    ...content.pages.map((p) => ({ label: p.title, href: `/pages/${p.handle}`, group: "Shopify pages" })),
    ...content.blogs.map((b) => ({ label: b.title, href: `/blogs/${b.handle}`, group: "Blogs" })),
    ...content.articles.map((a) => ({ label: a.title, href: `/blogs/${a.blogHandle}/${a.handle}`, group: "Blog posts" })),
    ...products.map((p) => ({ label: p.title, href: `/products/${p.handle}`, group: "Products" })),
    ...policies.map((p) => ({ label: p.title, href: `/policies/${p.handle}`, group: "Policies" })),
  ];
}
