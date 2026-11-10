# Connecting a Shopify store

Shopify stays the source of truth for products, variants, inventory, prices, discounts, shipping, tax, checkout, payments, orders and customers. This app only reads from it through the Storefront API.

Shopify changes its admin screens from time to time. If a label below does not match what you see, the current steps are in Shopify's guide: https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels

## 1. Install the Headless sales channel

In the Shopify admin, open the Shopify App Store, search for **Headless** (published by Shopify) and install it. It appears under **Sales channels**.

## 2. Create a storefront

**Sales channels > Headless > Add storefront.** Name it after the site, for example "Website".

## 3. Copy the access tokens

Open the storefront you just created and find the **Storefront API tokens** card.

- **Private access token**: copy into `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`. This is the one the app uses. It is server-only and must never be exposed to browsers.
- **Public access token**: optional. If you set `SHOPIFY_STOREFRONT_ACCESS_TOKEN` and no private token, the app falls back to it.

Then set `SHOPIFY_STORE_DOMAIN` to the store's `.myshopify.com` domain (Settings > Domains shows it).

```env
SHOPIFY_STORE_DOMAIN=client-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=paste-the-private-token-here
```

To rotate a token later: generate a new one in the same card, update the environment variable, redeploy, then delete the old token.

## 4. Make products available to the Headless channel

A product only appears on the site if it is published to **Headless**.

- One product: open it, and under **Publishing** tick **Headless**.
- Many products: on the Products list select them, then **More actions > Include in sales channels > Headless**.

Do the same for collections.

## 5. Check Storefront API permissions

On the storefront's page, open **Storefront API permissions** and click **Edit**. Make sure these are ticked, then save:

- Read products, variants and collections (product listings)
- Read and modify checkouts (needed for the cart and the checkout link)
- Read product inventory (lets Shopify stop customers adding more than is in stock)

New Headless storefronts usually have these on already. If "Add to cart" fails with a permissions message in the server log, this screen is where to fix it.

## 5b. Make the store able to take orders

The site hands the cart to Shopify's checkout, so checkout must work in Shopify itself:

- **Shipping:** at least one shipping rate for the countries the client sells to (Settings > Shipping and delivery).
- **Payments:** a payment provider switched on (Settings > Payments). While testing, use Shopify's test mode or the Bogus Gateway.
- **Taxes:** set as the client's accountant advises (Settings > Taxes and duties).
- **Plan and password:** an active paid plan, with the online store password removed, before real customers can pay.
- **Discount codes:** created in Shopify (Discounts). The site only passes the code along; Shopify decides whether it applies.
- **Filters:** to show filters on collection pages, install Shopify's free **Search & Discovery** app and choose the filters there. The site displays whatever is enabled, with no code change.

## 5c. Optional extras the site picks up automatically

- **Policies:** written under Settings > Policies. They appear at `/policies/...` with footer links.
- **Star ratings:** a review app that fills Shopify's standard rating fields. See FEATURES.md.
- **Customer accounts:** Settings > Customer accounts, then set `SHOPIFY_SHOP_ID`. See FEATURES.md.
- **Related products:** Shopify's Search & Discovery app improves "You may also like".

## 6. Match the store's market

In `config/store.config.ts`, set `locale.country` and `locale.language` to the market you sell in (for example `PH` and `en-PH`). They are sent with every query so Shopify returns the right currency and translations. Prices and currency always come from Shopify; nothing is hardcoded.

## 7. Verify

```bash
npm run dev
```

- `/collections` lists your collections and products.
- A product page shows the right price, compare-at price and sold-out state.
- Adding to cart opens the cart with the right price.
- "Check out" opens Shopify's checkout with the same items. Place one test order.
- Collection handles used in `config/navigation.config.ts` and `config/homepage.config.ts` exist in Shopify. A handle is the last part of the collection's URL in the admin's "Search engine listing".

If the page shows an error, the terminal prints a JSON line with `"scope":"shopify"` describing what Shopify returned. Tokens are never written to the log.

## What the app expects from Shopify data

Nothing beyond the basics. Missing images show a neutral placeholder, missing descriptions are skipped, sold-out products and variants are labelled, deleted products return the 404 page, and a compare-at price is only shown when it is higher than the price.
