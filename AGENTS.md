<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commerce Engine rules

This is a reusable storefront engine. Keep it reusable:

- Client-specific data (brand, copy, colors, menus, handles) lives only in `/config`. Never hardcode it in `app`, `components`, `lib` or `themes`.
- Components read configuration through `getSiteConfig()` from `@/config`, never from `config/*.config.ts` directly.
- Only `lib/shopify` talks to Shopify. Pages and components import from `@/lib/shopify`.
- Shopify is the source of truth for products, prices, inventory, discounts, shipping, tax and checkout. Do not re-implement any of them.
- Never invent stock numbers, urgency, reviews, or legal text.
- Colors, radii, shadows and spacing come from theme tokens (`bg-primary`, `rounded-lg`, `py-section`). No hex values in components.
- Catalog reads are cached with `"use cache"`. Cart and customer data must never be.
- `config/site.json` holds dashboard edits and overrides the `*.config.ts` files. New dashboard settings must be added to `lib/dashboard/schema.ts`.
- `/dashboard` is gated by `proxy.ts` and by `assertAdmin()` in every dashboard data function. Any new dashboard page or action must call `assertAdmin()` or `isAuthorized()`.
- Nothing tracks a visitor before consent. New analytics events go through `track()` in `lib/analytics`.
- HTML from Shopify is passed through `sanitizeRichText` before display.
- Run `npm run check` before finishing any change.
