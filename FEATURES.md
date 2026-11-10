# Features

Every optional feature has a switch in `config/features.config.ts` (or the dashboard's Features screen). Off means nothing is shown.

| Switch | What it does | Also needs |
| --- | --- | --- |
| `cartDrawer` | Opens the cart after "Add to cart" | |
| `quickView` | "Quick view" on product cards (desktop) | |
| `stickyAddToCart` | Keeps "Add to cart" on screen on phones | |
| `predictiveSearch` | Suggestions while typing in search | |
| `wishlist` | Heart on products, `/wishlist` page | `showWishlist` for the header icon |
| `recentlyViewed` | "Recently viewed" under the product page | |
| `reviews` | Star rating and count on cards and product pages | A review app in Shopify (below) |
| `mobileBottomNav` | Home, Shop, Search, Wishlist, Cart bar on phones | |
| `customerAccounts` | Account icon linking to Shopify's account pages | `SHOPIFY_SHOP_ID`, `showAccount` |
| `newsletter` | Sign-up form in the footer and the newsletter section | `NEWSLETTER_WEBHOOK_URL` on the live site |

`compare`, `testimonials` and `instagram` exist in the config for later and do nothing yet.

## Wishlist and recently viewed

Both are stored in the customer's own browser. No account, no server, no consent needed. They do not follow the customer to another device.

## Recommendations

"You may also like" on the product page uses Shopify's own related-products data. If Shopify returns nothing for a product, the section is not shown. Nothing is invented.

## Star ratings

The site reads Shopify's standard review fields (`reviews.rating` and `reviews.rating_count`). Review apps such as Judge.me, Loox, Yotpo and Shopify's own Product Reviews fill these in. In the app's settings, make sure those fields are available to the Storefront API. Products without reviews show no stars. Written reviews are not displayed yet; `lib/shopify/normalize.ts` is where a review-list provider would connect.

## Customer accounts

Shopify hosts the account pages: sign-in by emailed code, orders, addresses, profile. The site links to them, so no password or customer token ever touches this app.

1. In Shopify admin: Settings > Customer accounts. Make sure customer accounts are switched on.
2. Find the shop id: it is the number in the account page address `https://shopify.com/NUMBER/account`.
3. Set `SHOPIFY_SHOP_ID=NUMBER`. If the store uses its own account domain, set `SHOPIFY_ACCOUNT_URL=https://account.client.com` instead.

`/account` on the site then redirects there. Without either variable the account icon is hidden.

## Analytics

Set any of these environment variables; a tracker with no id never loads.

| Variable | Example |
| --- | --- |
| `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1234567890123456` |
| `NEXT_PUBLIC_TIKTOK_PIXEL_ID` | `CXXXXXXXXXXXXXXXXXXX` |

Events sent: `page_view`, `view_item`, `search` (from the header search box), `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_to_wishlist`.

**Purchases** happen on Shopify's checkout, not on this site, so they are not sent from here. Add the same GA4, Meta and TikTok ids in Shopify (Settings > Customer events, or each platform's Shopify app) to record purchases.

**Consent.** With `requireConsent: true` in `config/analytics.config.ts` (the default), no tracker loads and no tracking request is made until the visitor presses Accept on the cookie banner. Decline is remembered too. Set `privacyPolicyHref` there to link the banner to the privacy policy. Whether a client may switch consent off depends on where they sell; that is their lawyer's call, not ours.

The GA4 path was tested in a browser with a test id. The Meta and TikTok loaders follow each vendor's published snippet but have not been run against real accounts; check each one in its own "test events" tool on the first client.

## Newsletter and contact forms

Forms post JSON to a webhook URL, so any provider works: Klaviyo, Mailchimp, Zapier, Make, a Google Apps Script.

| Variable | Receives |
| --- | --- |
| `NEWSLETTER_WEBHOOK_URL` | `{ "type": "newsletter", "email", "source" }` |
| `CONTACT_WEBHOOK_URL` | `{ "type": "contact", "name", "email", "message", "source" }` |

- On the live site, a form with no webhook is **not shown**. A form that silently drops messages is worse than none. The contact page then shows the email address instead.
- In development, forms always show and submissions are only noted in the terminal, so you can try them.
- Spam protection: a hidden field that only bots fill, and a check that a complete message was not sent within 1.5 seconds of the page loading. There is no rate limit; add one at the webhook or with Vercel's firewall if a client is targeted.

## Content pages

`config/pages.config.ts` holds the About page (story blocks, optional facts, button), the FAQ page (grouped questions, also sent to Google as FAQ data) and the Contact page (form, details from `store.config.ts`, optional Google Maps embed). Set `enabled: false` to remove a page.

## Policy pages

Privacy, terms, refund and shipping policies are read from Shopify (Settings > Policies) and shown at `/policies/...`, with links added to the footer automatically. The text is cleaned of scripts before display. The engine never writes legal text: if the client has not written a policy in Shopify, there is no page and no link.
