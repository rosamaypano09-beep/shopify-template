export type ShopifyErrorKind = "network" | "http" | "graphql" | "timeout" | "user";

export class ShopifyError extends Error {
  name = "ShopifyError";

  constructor(
    message: string,
    readonly kind: ShopifyErrorKind,
    readonly status?: number,
  ) {
    super(message);
  }
}
