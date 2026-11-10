# Local setup

## Requirements

- Node.js 22 or newer (`node -v`)
- npm 10 or newer

Works in WSL Ubuntu, macOS and Linux. On Windows without WSL, use PowerShell 7.

## First run

```bash
npm install
cp .env.example .env.local     # optional: only needed to connect a real store
npm run dev
```

Open http://localhost:3000.

With an empty `.env.local`, development uses the demo catalog in `lib/shopify/mock/catalog.ts`. The terminal does not need to be restarted when you edit files in `/config`; the page reloads on save.

## Checking your work

```bash
npm run check
```

This runs ESLint, the TypeScript compiler and the tests. Run it before every commit and before every deploy.

To try a production build locally with the demo catalog:

```bash
SHOPIFY_USE_MOCK=true npm run build && SHOPIFY_USE_MOCK=true npm run start
```

## Environment variables

All of them are documented in `.env.example`:

| Variable | Needed for | Notes |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | Live store | `your-store.myshopify.com`, not the custom domain |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Live store | Server-only. Never prefix with `NEXT_PUBLIC_` |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Live store (fallback) | Public token, used only when no private token is set |
| `SHOPIFY_USE_MOCK` | Demo builds | `true` forces the demo catalog in any environment |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://client.com`, no trailing slash |
| `SHOPIFY_SHOP_ID` | Account icon | See FEATURES.md |
| `NEXT_PUBLIC_GA4_ID` and friends | Analytics | See FEATURES.md |
| `NEWSLETTER_WEBHOOK_URL`, `CONTACT_WEBHOOK_URL` | Forms on the live site | See FEATURES.md |
| `THEME` | Optional | `organic`, `luxury` or `minimal`; overrides `config/theme.config.ts` |

How the catalog source is chosen (`lib/env.ts`):

- Credentials set: the live Shopify store.
- `SHOPIFY_USE_MOCK=true`: the demo catalog.
- Neither, in development: the demo catalog.
- Neither, in production: the build stops with an error. A live site never silently shows demo products.

## Troubleshooting

**Build fails with "Shopify is not configured".** Add the store domain and a token, or set `SHOPIFY_USE_MOCK=true`.

**Products are missing.** In Shopify, each product must be available to the Headless sales channel. See SHOPIFY_SETUP.md, step 4.

**Product images do not load.** They must come from `cdn.shopify.com`, which is allowed in `next.config.ts`. Images hosted elsewhere need their hostname added to `images.remotePatterns`.

**A price or stock change in Shopify has not appeared.** Catalog data is cached for about a minute (`CATALOG_CACHE_LIFE` in `lib/shopify/source.ts`). Reload after a minute. Instant updates through Shopify webhooks arrive in Phase 6.

**"Add to cart" shows "We couldn't update your cart".** The server log has a line with `"scope":"cart"` and the reason. With a live store it is usually a missing Storefront API permission (SHOPIFY_SETUP.md, step 5).

**The cart says "This is the demo catalog, so there is no checkout".** No Shopify store is connected. Add the two Shopify values to `.env.local` and restart.

**No filters on collection pages.** The store has none enabled. Install Shopify's Search & Discovery app and choose filters there.

**Type errors mentioning `PageProps` after adding a route.** Run `npm run typecheck`; it regenerates route types first.

**A homepage section disappeared.** A section hides itself when its data is empty or Shopify fails, instead of breaking the page. Check the server log for a line with `"scope":"sections"`, and check that the collection handle in `config/homepage.config.ts` exists in Shopify.
