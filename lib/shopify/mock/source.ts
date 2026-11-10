import type { CatalogSource, Product, ProductFilterGroup, ProductSort, ProductSummary } from "../types";
import { mockCollections, mockProducts } from "./catalog";

function toSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    availableForSale: product.availableForSale,
    tags: product.tags,
    featuredImage: product.featuredImage,
    secondaryImage: product.secondaryImage,
    price: product.price,
    hasPriceRange: product.hasPriceRange,
    compareAtPrice: product.compareAtPrice,
    rating: product.rating,
  };
}

function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const byPrice = (a: Product, b: Product) => Number(a.price.amount) - Number(b.price.amount);
  if (sort === "price-asc") return [...products].sort(byPrice);
  if (sort === "price-desc") return [...products].sort(byPrice).reverse();
  return products;
}

function page(products: Product[], first: number, after: string | null | undefined) {
  const start = after ? Number(after) : 0;
  const slice = products.slice(start, start + first);
  const end = start + slice.length;
  return {
    products: slice.map(toSummary),
    pageInfo: { hasNextPage: end < products.length, endCursor: end < products.length ? String(end) : null },
  };
}

type FilterInput = {
  available?: boolean;
  productType?: string;
  productVendor?: string;
  tag?: string;
  price?: { min?: number; max?: number };
};

function parseInputs(inputs: string[] | undefined): FilterInput[] {
  const parsed: FilterInput[] = [];
  for (const input of inputs ?? []) {
    try {
      parsed.push(JSON.parse(input) as FilterInput);
    } catch {
      // ignore malformed input
    }
  }
  return parsed;
}

/** Same rule as Shopify: values of one filter widen the result, different filters narrow it. */
export function applyFilters(products: Product[], inputs: string[] | undefined): Product[] {
  const parsed = parseInputs(inputs);
  if (!parsed.length) return products;
  const availability = parsed.filter((f) => typeof f.available === "boolean").map((f) => f.available);
  const types = parsed.filter((f) => f.productType).map((f) => f.productType);
  const vendors = parsed.filter((f) => f.productVendor).map((f) => f.productVendor);
  const tagList = parsed.filter((f) => f.tag).map((f) => f.tag);
  const price = parsed.find((f) => f.price)?.price;

  return products.filter((product) => {
    const amount = Number(product.price.amount);
    if (availability.length && !availability.includes(product.availableForSale)) return false;
    if (types.length && !types.includes(product.productType)) return false;
    if (vendors.length && !vendors.includes(product.vendor)) return false;
    if (tagList.length && !tagList.some((tag) => tag && product.tags.includes(tag))) return false;
    if (price?.min !== undefined && amount < price.min) return false;
    if (price?.max !== undefined && amount > price.max) return false;
    return true;
  });
}

/** The filters a store with default Search & Discovery settings would offer. */
export function buildFilters(products: Product[]): ProductFilterGroup[] {
  if (!products.length) return [];
  const count = (test: (product: Product) => boolean) => products.filter(test).length;
  const types = [...new Set(products.map((product) => product.productType).filter(Boolean))].sort();
  const max = Math.max(...products.map((product) => Number(product.price.amount)));

  return [
    {
      id: "filter.v.availability",
      label: "Availability",
      type: "LIST",
      values: [
        {
          id: "filter.v.availability.1",
          label: "In stock",
          count: count((p) => p.availableForSale),
          input: JSON.stringify({ available: true }),
        },
        {
          id: "filter.v.availability.0",
          label: "Out of stock",
          count: count((p) => !p.availableForSale),
          input: JSON.stringify({ available: false }),
        },
      ],
    },
    {
      id: "filter.p.product_type",
      label: "Product type",
      type: "LIST",
      values: types.map((type) => ({
        id: `filter.p.product_type.${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        label: type,
        count: count((p) => p.productType === type),
        input: JSON.stringify({ productType: type }),
      })),
    },
    {
      id: "filter.v.price",
      label: "Price",
      type: "PRICE_RANGE",
      values: [
        {
          id: "filter.v.price",
          label: "Price",
          count: products.length,
          input: JSON.stringify({ price: { min: 0, max } }),
        },
      ],
    },
  ];
}

function matches(product: Product, query: string): boolean {
  const haystack = [product.title, product.productType, product.description, ...product.tags].join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export const mockSource: CatalogSource = {
  async getProduct(handle) {
    return mockProducts.find((product) => product.handle === handle) ?? null;
  },

  async getProducts({ first = 24, after, sort = "featured" } = {}) {
    return page(sortProducts(mockProducts, sort), first, after);
  },

  async getCollection(handle, { first = 24, after, sort = "featured", filters } = {}) {
    const collection = mockCollections.find((c) => c.handle === handle);
    if (!collection) return null;
    const { productHandles, ...rest } = collection;
    const products = productHandles
      .map((h) => mockProducts.find((p) => p.handle === h))
      .filter((p): p is Product => Boolean(p));
    return {
      ...rest,
      ...page(sortProducts(applyFilters(products, filters), sort), first, after),
      filters: buildFilters(products),
    };
  },

  async getCollections(first = 50) {
    return mockCollections.slice(0, first).map((collection) => {
      const { productHandles, ...rest } = collection;
      void productHandles;
      return rest;
    });
  },

  async getPolicies() {
    // The demo publishes no policies: legal text must come from the real store owner.
    return [];
  },

  async getRecommendations(productId) {
    const product = mockProducts.find((p) => p.id === productId);
    if (!product) return [];
    // Products that share a collection with this one, like Shopify's "related" intent.
    const related = new Set<string>();
    for (const collection of mockCollections) {
      if (collection.handle !== "best-sellers" && collection.productHandles.includes(product.handle)) {
        collection.productHandles.forEach((handle) => related.add(handle));
      }
    }
    related.delete(product.handle);
    return mockProducts.filter((p) => related.has(p.handle)).slice(0, 4).map(toSummary);
  },

  async search(query, { first = 24, after, sort = "relevance" } = {}) {
    const found = query.trim() ? mockProducts.filter((product) => matches(product, query)) : [];
    // Like Shopify's `unavailableProducts: LAST`.
    const ordered = [...found].sort((a, b) => Number(b.availableForSale) - Number(a.availableForSale));
    const sorted = sort === "relevance" ? ordered : sortProducts(ordered, sort);
    return { ...page(sorted, first, after), totalCount: found.length };
  },

  async predictiveSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], collections: [], suggestions: [] };
    const products = mockProducts.filter((product) => matches(product, q));
    const words = new Set<string>();
    for (const product of products) {
      const title = product.title.toLowerCase();
      if (title.includes(q)) words.add(title);
    }
    return {
      products: products.slice(0, 6).map(toSummary),
      collections: mockCollections
        .filter((collection) => collection.title.toLowerCase().includes(q))
        .slice(0, 4)
        .map(({ id, handle, title }) => ({ id, handle, title })),
      suggestions: [...words].slice(0, 4),
    };
  },
};
