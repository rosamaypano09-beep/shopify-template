# Store Builder dashboard

Open http://localhost:3000/dashboard while `npm run dev` is running.

The dashboard changes how the storefront looks and reads without editing code. It does not manage products, orders or customers; those stay in Shopify admin.

## Two ways to use it

### On your computer

`npm run dev`, then open `/dashboard`. No password is asked for unless you set `DASHBOARD_PASSWORD`. Changes are written to `config/site.json`; commit and push that file to publish them.

### On the live site, with a login

Open `https://client.com/dashboard` and sign in. A deployed site cannot change its own files, so each save commits `config/site.json` to the GitHub repository and Vercel redeploys. **A saved change appears on the live site after about a minute.**

The live dashboard exists only when all four of these are set in Vercel. If any is missing, every `/dashboard` address shows "page not found".

| Variable | Value |
| --- | --- |
| `DASHBOARD_PASSWORD` | At least 12 characters. Use a long random one from a password manager |
| `SESSION_SECRET` | At least 32 random characters. Run `openssl rand -hex 32` |
| `GITHUB_TOKEN` | A fine-grained personal access token limited to this one repository, with **Contents: Read and write** |
| `GITHUB_REPO` | `your-username/client-name` |

`GITHUB_BRANCH` is optional and defaults to `main`.

To create the token: GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token. Choose "Only select repositories", pick the client's repository, and under Repository permissions set Contents to Read and write.

### How it is protected

- A request check (`proxy.ts`) runs before any dashboard page is built. Without a valid sign-in, nothing of the dashboard is sent, only a redirect to the sign-in page.
- Every dashboard screen and every save checks the sign-in again.
- The sign-in cookie is signed with `SESSION_SECRET`, cannot be read by scripts, is sent only to `/dashboard`, and expires after 12 hours.
- A wrong password is answered after a short delay. There is no lockout after repeated failures; if that matters for a client, add a rate limit for `/dashboard/login` in Vercel's firewall.
- There is one shared password, not separate accounts. Change it in Vercel and redeploy to sign everyone out.

This login and the GitHub saving were tested on a local server. The GitHub step itself has not been run against a real repository; try one save on the first live site and check that a commit appears.

## Screens

| Screen | What you can change |
| --- | --- |
| Overview | Nothing. Shows the Shopify connection, product and collection counts, and a list of things to fix: links to collections that do not exist, homepage sections pointing at missing collections, products without photos, placeholder contact details, SEO gaps |
| Branding | One of eight presets, eleven colours, product card style, product image shape, animation level, footer style |
| Store details | Name, description, email, phone, social links, free-shipping amount |
| Homepage | Add, edit, reorder, duplicate, hide and delete sections: hero, benefits, collection tiles, products, brand statement, image with text, testimonials, logo row (trusted by), questions, newsletter |
| Shopify | Links that open the right Shopify admin screen: add a product, collection or discount, blog posts, files, policies, orders |
| Navigation | Announcement bar, top menu items, header options |
| SEO | Homepage title and description, title pattern |
| Features | Every feature switch |
| Preview | The real storefront at 1280, 768 and 390 pixels wide |

Press **Ctrl K** (or Cmd K) anywhere to search settings. The moon icon switches light and dark mode; it affects the dashboard only.

## How saving works

- **Save changes** writes only what you changed. Values are checked first; if one is wrong (a colour that is not a hex code, a link that does not start with `/` or `https://`), nothing is saved and the field shows why.
- **Reset to defaults** removes that screen's entries from `config/site.json`, so the values written in the `*.config.ts` files apply again.
- `config/site.json` always wins over the `*.config.ts` files. If a code change seems to have no effect, check whether the dashboard has saved a value for the same setting.
- To undo everything the dashboard ever saved, replace the contents of `config/site.json` with `{}`.

## What is still edited in code

| Setting | File |
| --- | --- |
| Logo and favicon files | `config/store.config.ts`, `public/brand/` |
| Fonts | `config/fonts.ts` |
| Dropdown menu columns and footer menu | `config/navigation.config.ts` |
| About, FAQ and contact page text | `config/pages.config.ts` |
| Address and business hours | `config/store.config.ts` |
| Social sharing image | `config/seo.config.ts` |
| Tracking ids | environment variables (see FEATURES.md) |

## Troubleshooting

**"/dashboard" shows page not found.** On your computer, use `npm run dev`. On the live site, one of the four variables above is missing or too short.

**Signed in, but saving fails on the live site.** The GitHub token cannot write to the repository, or `GITHUB_REPO` is wrong. The server log names the status GitHub returned.

**Saved, but the storefront looks the same.** Give it a second, then reload the store tab. In Preview, press Reload.

**A homepage section disappeared after saving.** Sections that read from Shopify hide when their collection handle is wrong. The Overview screen names the section and the handle.

**The settings file could not be written.** The project folder is read-only, or the file is open in a program that locks it. The terminal shows the reason.
