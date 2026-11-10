# Starting a new client

Each client gets their own copy of this repository and their own Vercel project. The engine folders (`app`, `components`, `lib`, `themes`) stay identical across clients, which is what lets you pull engine improvements into every client later.

## One-time: keep a clean engine repository

Push this project to a private GitHub repository, for example `commerce-engine`. Never put client content in it beyond the demo.

## Per client

### 1. Copy the engine

```bash
git clone git@github.com:YOU/commerce-engine.git client-name
cd client-name
git remote rename origin engine
git remote add origin git@github.com:YOU/client-name.git
git push -u origin main
npm install
```

The `engine` remote is how you bring in later engine updates:

```bash
git fetch engine
git merge engine/main
```

Conflicts can only happen in `/config` and `/public`, since those are the only places you edit for a client.

### 2. Connect Shopify

Follow SHOPIFY_SETUP.md, then:

```bash
cp .env.example .env.local
```

Fill in `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`.

### 3. Brand and store details: `config/store.config.ts`

- `name`, `description`
- `brand.logo`: `{ type: "text", text: "Name" }`, or `{ type: "image", src: "/brand/logo.svg", alt: "Name", width: 160, height: 40 }` with the file in `public/brand/`
- `brand.favicon`: replace `public/brand/favicon.svg`
- `contact`: only what the client wants public. Leave out anything they do not have
- `social`: only the networks they use
- `locale`: language, country, currency, timezone
- `promotions.freeShippingThreshold`: only if the client really offers it, and it must match the shipping rate set in Shopify

### 4. Look: `config/theme.config.ts` and `config/fonts.ts`

Pick a preset, override colors to match the brand, set the fonts. See THEMING.md.

### 5. Navigation: `config/navigation.config.ts`

- `main`: top menu. Give an item `groups` to make it a mega menu
- `footer`: footer link columns
- `policies`: privacy, terms, refunds, shipping. **The client must supply or approve this text.** Do not write legal copy for them
- `announcement`: the bar above the header, or `enabled: false`
- `header`: sticky, hide on scroll, transparent over the hero, and which actions show. Search and cart are on; leave account and wishlist off until those phases are built

Every collection link must use a handle that exists in the client's Shopify store.

### 6. Homepage: `config/homepage.config.ts`

Write the client's copy, point sections at their collection handles, replace the hero image (put it in `public/brand/`; around 2400px wide, under 400 KB).

### 7. SEO: `config/seo.config.ts`

Title template, default title and description, default social image (1200 x 630), organization name and logo.

### 8. Features: `config/features.config.ts`

`cartDrawer` opens the cart after "Add to cart"; `predictiveSearch` shows results while typing. Leave the rest off; they belong to later phases.

### 8b. Pages, tracking and forms

- `config/pages.config.ts`: the client's About story, FAQ and contact page wording.
- Tracking ids, form webhooks and the shop id go in environment variables. FEATURES.md lists them.
- Most of steps 3 to 8 can also be done in the dashboard: `npm run dev`, then open `/dashboard`. See DASHBOARD.md.

### 9. Remove the demo

```bash
rm -rf public/demo scripts/generate-demo-art.mjs
```

Search `/config` for `demo/` and `Bantay` to confirm nothing still points at it. Keep `lib/shopify/mock` as it is; the tests use it.

### 10. Check and deploy

```bash
npm run check
npm run build
```

Then follow VERCEL_DEPLOYMENT.md.

## Launch checklist

- [ ] Every menu and footer link opens a real page
- [ ] Product prices, sale prices and sold-out labels match Shopify
- [ ] Each variant can be chosen; sold-out variants cannot be added
- [ ] Add to cart, change quantity, remove: totals match Shopify
- [ ] "Check out" opens Shopify's checkout with the same items and prices
- [ ] One test order placed from start to finish, and visible in Shopify's Orders
- [ ] A real discount code applies; an invalid one is reported as not applying
- [ ] Search finds products by name; filters and sorting work on a collection
- [ ] Logo, favicon and social image are the client's
- [ ] No "Bantay" or `example.com` left anywhere
- [ ] Policies supplied or approved by the client
- [ ] `NEXT_PUBLIC_SITE_URL` is the live domain
- [ ] Site checked on a real phone
- [ ] Keyboard only: Tab reaches everything, focus is always visible, Escape closes menus

- [ ] Cookie banner appears; no tracker loads before Accept; events arrive in GA4 / Meta / TikTok test tools
- [ ] Purchases are tracked through Shopify's customer events
- [ ] Newsletter and contact forms deliver to the client's provider
- [ ] Account icon opens Shopify's sign-in page
- [ ] Policy pages show the client's own text
- [ ] The dashboard Overview shows nothing left to fix
