import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { buildClientSchema, Kind, parse, validate } from "graphql";
import { getVariableValues } from "graphql/execution/values";
import { describe, expect, it } from "vitest";
import {
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "@/lib/shopify/cart-live";
import {
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
  PREDICTIVE_SEARCH_QUERY,
  PRODUCT_QUERY,
  POLICIES_QUERY,
  PRODUCTS_QUERY,
  RECOMMENDATIONS_QUERY,
  SEARCH_QUERY,
} from "@/lib/shopify/live";

/**
 * Validates every Storefront API query against the schema that ships with
 * @shopify/hydrogen-react. A typo or a field Shopify removed fails here,
 * without needing a live store.
 */
const require = createRequire(import.meta.url);
const schemaJson = JSON.parse(readFileSync(require.resolve("@shopify/hydrogen-react/storefront.schema.json"), "utf8"));
// assumeValid: skip linting Shopify's own schema; only our queries are under test.
const schema = buildClientSchema(schemaJson.data ?? schemaJson, { assumeValid: true });

const queries = {
  PRODUCT_QUERY,
  PRODUCTS_QUERY,
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
  SEARCH_QUERY,
  PREDICTIVE_SEARCH_QUERY,
  RECOMMENDATIONS_QUERY,
  POLICIES_QUERY,
  CART_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_DISCOUNT_CODES_MUTATION,
};

describe("Storefront API queries and mutations", () => {
  for (const [name, query] of Object.entries(queries)) {
    it(`${name} is valid against the Storefront API schema`, () => {
      const errors = validate(schema, parse(query));
      expect(errors.map((error) => error.message)).toEqual([]);
    });
  }
});

/**
 * The same schema also checks the *values* we send: a misspelt input field
 * (say `variantId` instead of `merchandiseId`) fails here.
 */
describe("variables sent to Shopify", () => {
  const context = { country: "PH", language: "EN" };
  const cases: [string, string, Record<string, unknown>][] = [
    [
      "cartCreate",
      CART_CREATE_MUTATION,
      {
        input: {
          lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 2 }],
          buyerIdentity: { countryCode: "PH" },
        },
        ...context,
      },
    ],
    [
      "cartLinesAdd",
      CART_LINES_ADD_MUTATION,
      { cartId: "gid://shopify/Cart/1", lines: [{ merchandiseId: "gid://shopify/ProductVariant/1", quantity: 1 }], ...context },
    ],
    [
      "cartLinesUpdate",
      CART_LINES_UPDATE_MUTATION,
      { cartId: "gid://shopify/Cart/1", lines: [{ id: "gid://shopify/CartLine/1", quantity: 3 }], ...context },
    ],
    ["cartLinesRemove", CART_LINES_REMOVE_MUTATION, { cartId: "gid://shopify/Cart/1", lineIds: ["gid://shopify/CartLine/1"], ...context }],
    ["cartDiscountCodesUpdate", CART_DISCOUNT_CODES_MUTATION, { cartId: "gid://shopify/Cart/1", discountCodes: ["TEN"], ...context }],
    [
      "collection with filters and sort",
      COLLECTION_QUERY,
      {
        handle: "dresses",
        first: 24,
        after: null,
        sortKey: "PRICE",
        reverse: true,
        filters: [
          { available: true },
          { price: { min: 100, max: 900 } },
          { productType: "Dress" },
          { productVendor: "Acme" },
          { tag: "new" },
          { variantOption: { name: "Size", value: "M" } },
        ],
        ...context,
      },
    ],
    ["search", SEARCH_QUERY, { query: "chews", first: 24, after: null, sortKey: "RELEVANCE", reverse: false, ...context }],
    ["products", PRODUCTS_QUERY, { first: 24, after: null, sortKey: "BEST_SELLING", reverse: false, ...context }],
  ];

  for (const [name, query, variables] of cases) {
    it(`${name} variables match the schema's input types`, () => {
      const operation = parse(query).definitions.find((definition) => definition.kind === Kind.OPERATION_DEFINITION);
      if (!operation || operation.kind !== Kind.OPERATION_DEFINITION) throw new Error("no operation");
      const result = getVariableValues(schema, operation.variableDefinitions ?? [], variables);
      expect(result.errors?.map((error) => error.message) ?? []).toEqual([]);
    });
  }
});
