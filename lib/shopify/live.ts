import "server-only";
import type {
  ProductCollectionSortKeys,
  ProductSortKeys,
  SearchSortKeys,
} from "@shopify/hydrogen-react/storefront-api-types";
import { getSiteConfig } from "@/config";
import { getShopifyConnection } from "@/lib/env";
import { getBuyerContext, storefrontQuery } from "./client";
import { COLLECTION_FRAGMENT, IMAGE_FRAGMENT, PRODUCT_SUMMARY_FRAGMENT } from "./fragments";
import {
  normalizeArticle,
  normalizeArticleSummary,
  normalizeCollection,
  normalizeMenu,
  normalizePage,
  normalizeProduct,
  normalizeProductSummary,
  type RawArticle,
  type RawArticleSummary,
  type RawCollection,
  type RawMenuItem,
  type RawPage,
  type RawProduct,
  type RawProductSummary,
} from "./normalize";
import type { CatalogSource, PageInfo, ProductFilterGroup, ProductSort, SearchSort, ShopPolicy } from "./types";

const DEFAULT_PAGE_SIZE = 24;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductSummaryFields
      description
      productType
      updatedAt
      gallery: images(first: 12) {
        nodes {
          ...ImageFields
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            ...ImageFields
          }
        }
      }
      seo {
        title
        description
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...ProductSummaryFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...CollectionFields
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        nodes {
          ...ProductSummaryFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
      }
    }
  }
  ${COLLECTION_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

export const POLICIES_QUERY = /* GraphQL */ `
  query Policies($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyFields
      }
      refundPolicy {
        ...PolicyFields
      }
      shippingPolicy {
        ...PolicyFields
      }
      termsOfService {
        ...PolicyFields
      }
    }
  }
  fragment PolicyFields on ShopPolicy {
    handle
    title
    body
  }
`;

export const RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query Recommendations($productId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId, intent: RELATED) {
      ...ProductSummaryFields
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const SEARCH_QUERY = /* GraphQL */ `
  query Search(
    $query: String!
    $first: Int!
    $after: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    search(
      query: $query
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
      types: [PRODUCT]
      unavailableProducts: LAST
    ) {
      totalCount
      nodes {
        ... on Product {
          ...ProductSummaryFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

export const PREDICTIVE_SEARCH_QUERY = /* GraphQL */ `
  query PredictiveSearch($query: String!, $limit: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    predictiveSearch(query: $query, limit: $limit, limitScope: EACH, types: [PRODUCT, COLLECTION, QUERY]) {
      products {
        ...ProductSummaryFields
      }
      collections {
        id
        handle
        title
      }
      queries {
        text
      }
    }
  }
  ${PRODUCT_SUMMARY_FRAGMENT}
`;

const ARTICLE_SUMMARY_FIELDS = /* GraphQL */ `
  fragment ArticleSummaryFields on Article {
    id
    handle
    title
    excerpt
    # Plain-text start of the post, used when the Excerpt field is left empty.
    contentPreview: content(truncateAt: 200)
    publishedAt
    image {
      ...ImageFields
    }
    authorV2 {
      name
    }
    tags
    blog {
      handle
    }
  }
`;

export const BLOG_QUERY = /* GraphQL */ `
  query Blog(
    $handle: String!
    $first: Int!
    $after: String
    $query: String
    $country: CountryCode
    $language: LanguageCode
  )
  @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      id
      handle
      title
      seo {
        title
        description
      }
      articles(first: $first, after: $after, query: $query, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...ArticleSummaryFields
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${ARTICLE_SUMMARY_FIELDS}
  ${IMAGE_FRAGMENT}
`;

export const ARTICLE_QUERY = /* GraphQL */ `
  query Article($blogHandle: String!, $articleHandle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        ...ArticleSummaryFields
        contentHtml
        tags
        seo {
          title
          description
        }
      }
    }
  }
  ${ARTICLE_SUMMARY_FIELDS}
  ${IMAGE_FRAGMENT}
`;

export const PAGE_QUERY = /* GraphQL */ `
  query Page($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      updatedAt
      seo {
        title
        description
      }
    }
  }
`;

export const MENU_QUERY = /* GraphQL */ `
  query Menu($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    menu(handle: $handle) {
      items {
        title
        url
        type
        items {
          title
          url
          type
          items {
            title
            url
            type
          }
        }
      }
    }
  }
`;

export const CONTENT_INDEX_QUERY = /* GraphQL */ `
  query ContentIndex($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    pages(first: 100) {
      nodes {
        handle
        title
      }
    }
    blogs(first: 25) {
      nodes {
        handle
        title
      }
    }
    articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) {
      nodes {
        handle
        title
        blog {
          handle
        }
      }
    }
  }
`;

/** Hostnames that count as "this shop" when turning menu URLs into storefront paths. */
function shopHosts(): string[] {
  const hosts: string[] = [];
  const connection = getShopifyConnection();
  if (connection.mode === "live") hosts.push(connection.storeDomain);
  try {
    hosts.push(new URL(getSiteConfig().store.url).hostname);
  } catch {
    // No site URL configured.
  }
  return hosts;
}

const searchSort: Record<SearchSort, { sortKey: SearchSortKeys; reverse: boolean }> = {
  relevance: { sortKey: "RELEVANCE", reverse: false },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

/** Filter inputs arrive as JSON strings from the URL; anything unparsable is dropped. */
function parseFilterInputs(inputs: string[] | undefined): Record<string, unknown>[] {
  const parsed: Record<string, unknown>[] = [];
  for (const input of inputs ?? []) {
    try {
      const value: unknown = JSON.parse(input);
      if (value && typeof value === "object" && !Array.isArray(value)) parsed.push(value as Record<string, unknown>);
    } catch {
      // ignore
    }
  }
  return parsed;
}

const productSort: Record<ProductSort, { sortKey: ProductSortKeys; reverse: boolean }> = {
  featured: { sortKey: "RELEVANCE", reverse: false },
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  newest: { sortKey: "CREATED_AT", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

const collectionSort: Record<ProductSort, { sortKey: ProductCollectionSortKeys; reverse: boolean }> = {
  featured: { sortKey: "COLLECTION_DEFAULT", reverse: false },
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  newest: { sortKey: "CREATED", reverse: true },
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
};

interface Connection<T> {
  nodes: T[];
  pageInfo: PageInfo;
}

export const liveSource: CatalogSource = {
  async getProduct(handle) {
    const data = await storefrontQuery<{ product: RawProduct | null }, Record<string, unknown>>(PRODUCT_QUERY, {
      handle,
      ...getBuyerContext(),
    });
    return data.product ? normalizeProduct(data.product) : null;
  },

  async getProducts({ first = DEFAULT_PAGE_SIZE, after = null, sort = "featured" } = {}) {
    const data = await storefrontQuery<{ products: Connection<RawProductSummary> }, Record<string, unknown>>(
      PRODUCTS_QUERY,
      { first, after, ...productSort[sort], ...getBuyerContext() },
    );
    return {
      products: data.products.nodes.map(normalizeProductSummary),
      pageInfo: data.products.pageInfo,
    };
  },

  async getCollection(handle, { first = DEFAULT_PAGE_SIZE, after = null, sort = "featured", filters } = {}) {
    const data = await storefrontQuery<
      {
        collection:
          | (RawCollection & { products: Connection<RawProductSummary> & { filters?: ProductFilterGroup[] | null } })
          | null;
      },
      Record<string, unknown>
    >(COLLECTION_QUERY, {
      handle,
      first,
      after,
      filters: parseFilterInputs(filters),
      ...collectionSort[sort],
      ...getBuyerContext(),
    });
    if (!data.collection) return null;
    return {
      ...normalizeCollection(data.collection),
      products: data.collection.products.nodes.map(normalizeProductSummary),
      pageInfo: data.collection.products.pageInfo,
      filters: data.collection.products.filters ?? [],
    };
  },

  async getCollections(first = 50) {
    const data = await storefrontQuery<{ collections: { nodes: RawCollection[] } }, Record<string, unknown>>(
      COLLECTIONS_QUERY,
      { first, ...getBuyerContext() },
    );
    return data.collections.nodes.map(normalizeCollection);
  },

  async getPolicies() {
    const data = await storefrontQuery<{ shop: Record<string, ShopPolicy | null> }, Record<string, unknown>>(
      POLICIES_QUERY,
      getBuyerContext(),
    );
    return Object.values(data.shop).filter((policy): policy is ShopPolicy => Boolean(policy?.body));
  },

  async getRecommendations(productId) {
    const data = await storefrontQuery<{ productRecommendations: RawProductSummary[] | null }, Record<string, unknown>>(
      RECOMMENDATIONS_QUERY,
      { productId, ...getBuyerContext() },
    );
    return (data.productRecommendations ?? []).slice(0, 8).map(normalizeProductSummary);
  },

  async search(query, { first = DEFAULT_PAGE_SIZE, after = null, sort = "relevance" } = {}) {
    const data = await storefrontQuery<
      { search: { totalCount: number; nodes: (RawProductSummary | Record<string, never>)[]; pageInfo: PageInfo } },
      Record<string, unknown>
    >(SEARCH_QUERY, { query, first, after, ...searchSort[sort], ...getBuyerContext() });
    return {
      products: data.search.nodes
        .filter((node): node is RawProductSummary => "handle" in node)
        .map(normalizeProductSummary),
      pageInfo: data.search.pageInfo,
      totalCount: data.search.totalCount,
    };
  },

  async predictiveSearch(query) {
    const data = await storefrontQuery<
      {
        predictiveSearch: {
          products: RawProductSummary[];
          collections: { id: string; handle: string; title: string }[];
          queries: { text: string }[];
        } | null;
      },
      Record<string, unknown>
    >(PREDICTIVE_SEARCH_QUERY, { query, limit: 6, ...getBuyerContext() });
    const result = data.predictiveSearch;
    return {
      products: (result?.products ?? []).map(normalizeProductSummary),
      collections: result?.collections ?? [],
      suggestions: (result?.queries ?? []).map((entry) => entry.text),
    };
  },

  async getBlog(handle, { first = 12, after = null, tag } = {}) {
    const data = await storefrontQuery<
      {
        blog:
          | {
              id: string;
              handle: string;
              title: string;
              seo?: { title?: string | null; description?: string | null } | null;
              articles: { nodes: RawArticleSummary[]; pageInfo: PageInfo };
            }
          | null;
      },
      Record<string, unknown>
    >(BLOG_QUERY, { handle, first, after, query: tag ? `tag:'${tag.replace(/['\\]/g, "")}'` : null, ...getBuyerContext() });
    if (!data.blog) return null;
    return {
      id: data.blog.id,
      handle: data.blog.handle,
      title: data.blog.title,
      seo: { title: data.blog.seo?.title ?? null, description: data.blog.seo?.description ?? null },
      articles: data.blog.articles.nodes.map((node) => normalizeArticleSummary(node, data.blog?.handle)),
      pageInfo: data.blog.articles.pageInfo,
    };
  },

  async getArticle(blogHandle, articleHandle) {
    const data = await storefrontQuery<{ blog: { articleByHandle: RawArticle | null } | null }, Record<string, unknown>>(
      ARTICLE_QUERY,
      { blogHandle, articleHandle, ...getBuyerContext() },
    );
    const article = data.blog?.articleByHandle;
    return article ? normalizeArticle(article, blogHandle) : null;
  },

  async getPage(handle) {
    const data = await storefrontQuery<{ page: RawPage | null }, Record<string, unknown>>(PAGE_QUERY, {
      handle,
      ...getBuyerContext(),
    });
    return data.page ? normalizePage(data.page) : null;
  },

  async getMenu(handle) {
    const data = await storefrontQuery<{ menu: { items: RawMenuItem[] } | null }, Record<string, unknown>>(MENU_QUERY, {
      handle,
      ...getBuyerContext(),
    });
    return normalizeMenu(data.menu?.items, shopHosts());
  },

  async listContent() {
    type Entry = { handle: string; title: string };
    const data = await storefrontQuery<
      { pages: { nodes: Entry[] }; blogs: { nodes: Entry[] }; articles: { nodes: (Entry & { blog: { handle: string } })[] } },
      Record<string, unknown>
    >(CONTENT_INDEX_QUERY, getBuyerContext());
    return {
      pages: data.pages.nodes,
      blogs: data.blogs.nodes,
      articles: data.articles.nodes.map((a) => ({ handle: a.handle, title: a.title, blogHandle: a.blog.handle })),
    };
  },
};
