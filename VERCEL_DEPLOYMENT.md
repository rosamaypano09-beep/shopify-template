# Deploying to Vercel

```text
GitHub repository  ->  Vercel project  ->  Environment variables  ->  Custom domain
```

One Vercel project per client.

## 1. Push to GitHub

The client repository from CLIENT_SETUP.md, on its `main` branch. `.env.local` is ignored by git; secrets never go in the repository.

## 2. Import into Vercel

Vercel dashboard > **Add New > Project** > pick the repository. Vercel detects Next.js; leave the build settings as they are.

## 3. Environment variables

**Project Settings > Environment Variables.** Add each for the environments shown.

| Variable | Production | Preview | Value |
| --- | --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | yes | yes | `client-store.myshopify.com` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | yes | yes | from the Headless channel. Mark as **Sensitive** |
| `NEXT_PUBLIC_SITE_URL` | yes | no | `https://client.com` |
| `THEME` | optional | optional | only to override `config/theme.config.ts` |

Changing a variable does not affect existing deployments. Redeploy after every change.

To put a demo online without a store, set only `SHOPIFY_USE_MOCK=true`.

## 4. Deploy

Click **Deploy**. Every later push to `main` deploys to production. Every other branch and pull request gets its own preview URL.

Preview deployments tell search engines not to index them (`allowIndexing` in `config/seo.config.ts` is false whenever `VERCEL_ENV` is not `production`).

## 5. Custom domain

**Project Settings > Domains > Add.** Add both `client.com` and `www.client.com`, and choose which one redirects to the other.

At the client's domain registrar, create the records Vercel shows on that screen. Typically:

| Type | Name | Value |
| --- | --- | --- |
| `A` | `@` | the IP address Vercel displays |
| `CNAME` | `www` | the `cname.vercel-dns…` target Vercel displays |

Use the exact values from the Vercel screen, since they can differ per project. DNS changes usually take minutes, sometimes a few hours. Vercel issues the HTTPS certificate automatically once the records resolve.

Then:

1. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.
2. In Shopify, keep the store's own domain as is. Checkout runs on Shopify's domain or on a subdomain such as `checkout.client.com` that you point at Shopify under **Settings > Domains**. Do not point the main domain at Shopify; it belongs to Vercel now.

## 6. After deploying

- Open `/robots.txt` and `/sitemap.xml` on the live domain.
- Paste the homepage URL into https://www.opengraph.xyz to check the social preview.
- Submit the sitemap in Google Search Console.

## Notes

- **Catalog freshness:** product and collection data is cached for about a minute. Phase 6 adds a Shopify webhook that refreshes a product the moment it changes.
- **Logs:** Vercel > project > **Logs**. Shopify problems appear as JSON lines with `"scope":"shopify"`.
- **Image optimization** counts toward Vercel's usage. If a client has a very large catalog, switching product images to Shopify's own CDN resizing is a small change in `components/ui/shop-image.tsx`.
