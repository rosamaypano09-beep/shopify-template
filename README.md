# Commerce Engine

One headless Shopify storefront, reused for every client. Shopify holds the products, prices, stock, checkout and orders. This app controls how the store looks and reads. A new client is a new `/config` folder and a new set of environment variables; the engine code is untouched.

```text
                 COMMERCE ENGINE  (app, components, lib, themes)
                          |
        ------------------+------------------
        |                 |                 |
   /config (A)       /config (B)       /config (C)
   Shopify store A   Shopify store B   Shopify store C
   preset: organic   preset: luxury    preset: minimal
```

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no Shopify credentials, development runs the bundled demo catalog ("Bantay Daily", a placeholder dog-supplement brand). To connect a real store, follow [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (needs Shopify credentials or `SHOPIFY_USE_MOCK=true`) |
| `npm run start` | Serve the production build |
| `npm run check` | Lint, typecheck and tests in one go |
| `npm run test` | Unit tests, including validation of every Shopify query against the Storefront API schema |
| `npm run demo-art` | Regenerate the demo pack shots in `public/demo` |

## Stack

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, `@shopify/hydrogen-react` for the Storefront API client and types, Radix primitives with shadcn-style components, Motion, Zod, Vitest.

**About "Hydrogen":** Shopify's Hydrogen framework is built on React Router and cannot run inside Next.js. The supported way to use Hydrogen with Next.js is `@shopify/hydrogen-react`, Shopify's framework-agnostic package of the same Storefront API client, types, and cart/media components. That is what this project uses.

**About shadcn/ui:** the components in `components/ui` follow shadcn conventions (Radix + `cva` + `cn`) but are written against this project's design tokens rather than pulled from the shadcn CLI, so every component is themeable per client.

## Where things live

```text
config/            EVERYTHING client-specific. The only folder you edit per client.
  site.json            edits saved by the dashboard; sits on top of the files below
  pages.config.ts      about, FAQ and contact pages
  analytics.config.ts  tracker ids and consent
  store.config.ts      name, logo, contact, social, locale
  theme.config.ts      which preset, plus overrides
  fonts.ts             the two typefaces
  navigation.config.ts header options, announcement, menus, footer, policy links
  homepage.config.ts   homepage sections, in order
  features.config.ts   feature switches
  seo.config.ts        titles, descriptions, social image, indexing
  types.ts             types for all of the above
  index.ts             getSiteConfig(): the one function the engine reads config through

themes/            Eight presets and the token -> CSS variable mapping
lib/shopify/       The only code that talks to Shopify
  client.ts            Storefront API fetch, errors, logging
  live.ts              catalog and search queries
  cart-live.ts         cart query and mutations
  mock/                demo catalog and demo cart, used when no store is connected
  products.ts          getProduct, getProducts            (cached)
  collections.ts       getCollection, getCollections      (cached)
  search.ts            searchProducts, predictiveSearch   (cached)
  normalize.ts         raw GraphQL -> the small types the UI uses
lib/cart/          cart server actions (never cached)
lib/catalog/       URL state for filters and sorting, variant selection logic
lib/               env validation, logger, money formatting, SEO helpers
components/ui/     design system primitives
components/layout/ announcement bar, header, mega menu, mobile menu, footer
components/sections/ homepage sections and the renderer
components/product/    card, grid, price, gallery, variant picker and buy box
components/collection/ card, filter panel, filter drawer, sort
components/cart/       cart provider, drawer, cart page, checkout button
components/search/     search-as-you-type panel
components/dashboard/  Store Builder screens
components/analytics/  consent banner and tracker loading
components/forms/      newsletter and contact forms
lib/dashboard/         saved settings, validation, health checks
lib/analytics/         track(), providers, consent
lib/forms/             form actions and webhook delivery
app/               routes
tests/             unit tests
```

Two rules keep the engine reusable:

1. Components never import from `config/*.config.ts` directly. They call `getSiteConfig()`.
2. Components never call Shopify directly. They import from `@/lib/shopify`.

## Build status

| Phase | Scope | Status |
| --- | --- | --- |
| 1. Foundation | Next.js, TypeScript, Shopify connection, config system, themes, design tokens, core UI, header, mega menu, mobile menu, footer, homepage sections, SEO basics, error and 404 pages | **Done** |
| 2. Commerce | Variant picker, swipeable gallery, cart drawer and cart page, discount codes, free-shipping progress, checkout handoff, buy now, collection filters and sorting, show more, search page, search-as-you-type | **Done** |
| 3. Premium UX | Quick view, wishlist, recently viewed, Shopify recommendations, sticky add to cart on phones, optional bottom bar on phones | **Done** |
| 4. CMS | Store Builder dashboard, on your computer or on the live site behind a login: overview and health checks, branding, store details, homepage section editor, navigation, SEO, feature switches, preview at three widths, command menu, dark mode | **Done** |
| 5. Business | Analytics (GA4, Meta, TikTok) behind a consent banner, customer accounts through Shopify, star ratings from review apps, newsletter and contact forms through webhooks, about / FAQ / contact pages, policy pages from Shopify | **Done** |
| 6. Production | Webhook revalidation, monitoring, accessibility and performance audits, end-to-end tests in the repo | Next |

Not built: blog, image zoom, low-stock notices, product comparison, Instagram feed, written review lists (ratings only), editing Shopify products, collections, discounts and blog posts inside the dashboard (it links to Shopify admin for those), and custom login screens (accounts use Shopify's own pages).

### How buying works

1. The product page picks a variant. Sold-out and non-existent combinations are labelled and cannot be added.
2. "Add to cart" calls a server action (`lib/cart/actions.ts`). The server talks to Shopify; the browser never sees a token. The only thing stored in the browser is the cart id, in an httpOnly cookie.
3. The cart lives in Shopify, so prices, stock limits and discount codes are always Shopify's answer, never ours.
4. "Check out" sends the customer to the cart's `checkoutUrl`, Shopify's hosted checkout. Payment, shipping, tax and order emails all happen there.

Pages stay cacheable because the cart is loaded in the browser after the page appears.

### What has not been tested against a live store

Everything runs and is tested against the demo catalog, and every Shopify query and mutation is validated against Shopify's published API schema. The handoff to a real Shopify checkout can only be confirmed with a real store: on the first client, add an item, press "Check out", and place a test order (CLIENT_SETUP.md has the checklist).

In the demo catalog there is no checkout; the cart shows a note in place of the button.

## More

- [SETUP.md](./SETUP.md): local development
- [DASHBOARD.md](./DASHBOARD.md): the Store Builder dashboard
- [FEATURES.md](./FEATURES.md): every feature switch, analytics, forms, accounts, reviews
- [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md): connecting a store
- [THEMING.md](./THEMING.md): presets, tokens, fonts, sections
- [CLIENT_SETUP.md](./CLIENT_SETUP.md): starting a new client from this repo
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md): deploying and custom domains
