import "server-only";
import { getBuyerContext, storefrontQuery } from "./client";
import { ShopifyError } from "./errors";
import { IMAGE_FRAGMENT } from "./fragments";
import { effectiveCompareAt, normalizeImage, type RawImage } from "./normalize";
import type { Cart, CartSource, Money } from "./types";

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          amountPerQuantity {
            amount
            currencyCode
          }
          compareAtAmountPerQuantity {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            image {
              ...ImageFields
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const CART_QUERY = /* GraphQL */ `
  query Cart($cartId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($input: CartInput!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate(
    $cartId: ID!
    $lines: [CartLineUpdateInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_DISCOUNT_CODES_MUTATION = /* GraphQL */ `
  mutation CartDiscountCodesUpdate(
    $cartId: ID!
    $discountCodes: [String!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  discountCodes?: { code: string; applicable: boolean }[] | null;
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: Money; amountPerQuantity: Money; compareAtAmountPerQuantity?: Money | null };
      merchandise: {
        id?: string;
        title?: string;
        availableForSale?: boolean;
        image?: RawImage | null;
        product?: { handle: string; title: string };
      };
    }[];
  };
}

interface CartPayload {
  cart: RawCart | null;
  userErrors: { message: string }[];
}

export function normalizeCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: raw.cost.subtotalAmount,
    total: raw.cost.totalAmount,
    discountCodes: raw.discountCodes ?? [],
    lines: raw.lines.nodes
      // A line whose product was deleted comes back without merchandise details.
      .filter((line) => line.merchandise.id && line.merchandise.product)
      .map((line) => ({
        id: line.id,
        quantity: line.quantity,
        merchandiseId: line.merchandise.id as string,
        productHandle: line.merchandise.product?.handle ?? "",
        productTitle: line.merchandise.product?.title ?? "",
        variantTitle: line.merchandise.title === "Default Title" ? "" : (line.merchandise.title ?? ""),
        image: normalizeImage(line.merchandise.image),
        unitPrice: line.cost.amountPerQuantity,
        compareAtUnitPrice: effectiveCompareAt(line.cost.amountPerQuantity, line.cost.compareAtAmountPerQuantity),
        totalPrice: line.cost.totalAmount,
        availableForSale: line.merchandise.availableForSale ?? false,
      })),
  };
}

/** Shopify reports problems such as "not enough stock" as userErrors, not as failures. */
function unwrap(payload: CartPayload | null | undefined): Cart {
  const message = payload?.userErrors?.[0]?.message;
  if (message) throw new ShopifyError(message, "user");
  if (!payload?.cart) throw new ShopifyError("Shopify did not return a cart.", "graphql");
  return normalizeCart(payload.cart);
}

type Vars = Record<string, unknown>;

export const liveCartSource: CartSource = {
  async getCart(cartId) {
    const data = await storefrontQuery<{ cart: RawCart | null }, Vars>(CART_QUERY, {
      cartId,
      ...getBuyerContext(),
    });
    return data.cart ? normalizeCart(data.cart) : null;
  },

  async createCart(lines) {
    const context = getBuyerContext();
    const data = await storefrontQuery<{ cartCreate: CartPayload }, Vars>(CART_CREATE_MUTATION, {
      input: { lines, buyerIdentity: { countryCode: context.country } },
      ...context,
    });
    return unwrap(data.cartCreate);
  },

  async addLines(cartId, lines) {
    const data = await storefrontQuery<{ cartLinesAdd: CartPayload }, Vars>(CART_LINES_ADD_MUTATION, {
      cartId,
      lines,
      ...getBuyerContext(),
    });
    return unwrap(data.cartLinesAdd);
  },

  async updateLines(cartId, lines) {
    const data = await storefrontQuery<{ cartLinesUpdate: CartPayload }, Vars>(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines,
      ...getBuyerContext(),
    });
    return unwrap(data.cartLinesUpdate);
  },

  async removeLines(cartId, lineIds) {
    const data = await storefrontQuery<{ cartLinesRemove: CartPayload }, Vars>(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds,
      ...getBuyerContext(),
    });
    return unwrap(data.cartLinesRemove);
  },

  async updateDiscountCodes(cartId, discountCodes) {
    const data = await storefrontQuery<{ cartDiscountCodesUpdate: CartPayload }, Vars>(
      CART_DISCOUNT_CODES_MUTATION,
      { cartId, discountCodes, ...getBuyerContext() },
    );
    return unwrap(data.cartDiscountCodesUpdate);
  },
};
