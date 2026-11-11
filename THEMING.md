# Theming

A client's look comes from three files in `/config`. No component changes are needed.

| File | Controls |
| --- | --- |
| `theme.config.ts` | Which preset, and any overrides on top of it |
| `fonts.ts` | The heading and body typefaces |
| `homepage.config.ts` | Which sections appear on the homepage, in what order, with what copy |

## Presets

| Preset | Character | Suits | Designed with |
| --- | --- | --- | --- |
| `organic` | Warm, rounded, friendly | Pet, wellness, food, baby, handmade | Bricolage Grotesque + Figtree |
| `luxury` | Quiet, high contrast, square corners, more space | Jewelry, fashion, beauty, furniture | Cormorant Garamond + Jost |
| `minimal` | Neutral, compact, functional | Electronics, stationery, general retail | Schibsted Grotesk for both |
| `fashion` | Monochrome, image-led, portrait photos | Clothing, accessories, footwear | Schibsted Grotesk, or Cormorant Garamond + Jost |
| `beauty` | Soft, light, rounded | Skincare, cosmetics, wellness | Cormorant Garamond + Figtree |
| `food` | Warm and appetising | Bakery, cafe, restaurant, packaged food | Bricolage Grotesque + Figtree |
| `tech` | Crisp, cool, compact | Electronics, gadgets, sports | Schibsted Grotesk for both |
| `midnight` | Dark background, bright accent | Gaming, streetwear, premium tech | Bricolage Grotesque + Figtree |
| `velvet` | Ink-dark pages, magenta accent, heavy serif, pill buttons | Patisserie, heritage food, gifting | Playfair Display + Figtree |

Choose one in the dashboard (Branding), in `config/theme.config.ts`, or with the `THEME` environment variable. Every preset is tested to keep text readable on its backgrounds.

A preset sets colors, heading weight and tracking, type scale, corner radius, shadows, section spacing, page width, motion timing, the product card style, product image ratio and footer style.

More presets (fashion, beauty, food, electronics and so on) are added by copying a file in `themes/presets/`, changing the values, and registering it in `themes/index.ts`. The engine and the dashboard in Phase 4 pick them up automatically.

## Overrides

Anything in a preset can be overridden per client:

```ts
// config/theme.config.ts
export const themeConfig: ThemeConfig = {
  preset: "organic",
  overrides: {
    tokens: {
      colors: { primary: "#0B5FFF", accent: "#FFD400", accentForeground: "#1A1400" },
      radius: { control: "10px" },
    },
    variants: { productCard: "editorial", productImageRatio: "portrait", footer: "surface" },
  },
};
```

### Colors

| Token | Used for |
| --- | --- |
| `background`, `text`, `textMuted`, `border` | The page |
| `surface` | Tinted panels, image placeholders, light footer |
| `primary` / `primaryForeground` | Main buttons, dark sections, dark footer |
| `secondary` / `secondaryForeground` | Quiet buttons and info badges |
| `accent` / `accentForeground` | Announcement bar, sale badges, highlight buttons |
| `highlight` (derived) | `text-highlight`: the primary colour mixed toward the text colour, so it stays readable as small text. Hero eyebrow and headline accent |
| `success`, `warning`, `danger` | Status messages |

Each `…Foreground` color is the text that sits on its pair. When you change a color, check the pair still has a contrast ratio of at least 4.5:1 (https://webaim.org/resources/contrastchecker/).

### Product card styles

`minimal`, `modern`, `editorial`, `luxury`, `compact`, `image-first`. Set with `variants.productCard`.

### Animation

`variants.animation`: `lively`, `subtle` or `none`. Visitors who ask their device for reduced motion always get almost none, whatever this is set to.

## Fonts

Fonts are self-hosted from `assets/fonts` (no request to Google, no layout shift). Six variable fonts are bundled:

```text
bricolage-grotesque-latin-wght-normal.woff2
figtree-latin-wght-normal.woff2
cormorant-garamond-latin-wght-normal.woff2
jost-latin-wght-normal.woff2
schibsted-grotesk-latin-wght-normal.woff2
playfair-display-latin-wght-normal.woff2
```

To change a typeface, edit the `src` line in `config/fonts.ts`. To use a font that is not bundled, add its `.woff2` file to `assets/fonts` and point `src` at it. Check the font's licence allows self-hosting; fonts from Google Fonts do.

Switching preset does not switch fonts by itself, because Next.js needs font files declared in code. Change both when you change preset.

## How tokens reach the page

`themes/css-vars.ts` turns the resolved theme into CSS custom properties (`--ce-color-primary`, `--ce-radius-lg`, …) set on `<html>`. `app/globals.css` maps those onto Tailwind utilities, so components use `bg-primary`, `rounded-lg`, `shadow-md`, `py-section`, `container-site` and never a hex value.

Type styles are utilities too: `type-display`, `type-h1` to `type-h4`, `type-body-lg`, `type-body`, `type-small`, `type-caption`, `type-button`. Sizes scale smoothly from 320px to 1440px wide.

## Section icons

About 70 icons, grouped, are listed in `lib/section-icons.ts` and drawn in `components/sections/icons.ts`. To add one, add its name to a group and its lucide icon to the map; TypeScript reports a name without a drawing.

## Homepage sections

`config/homepage.config.ts` is a list. The page renders it top to bottom.

- Reorder the list to reorder the page.
- Set `enabled: false` to hide a section.
- Copy an entry and give it a new `id` to use a section twice.
- Look options on every section except the hero:
  - `background`: `default`, `surface`, `glow` (page colour with a brand glow), `secondary`, `primary` or `inverse` (page and text colours swapped). Each band re-points the colour tokens inside it, so muted text, borders and buttons stay readable.
  - `shape`: `flat`, `curved` (arched top and bottom) or `card` (inset rounded panel).
  - `backdrop`: an animated background in theme colours: `aurora`, `orbs`, `stars`, `gradient` or `grid`. Still for visitors who prefer less motion and when `variants.animation` is `none`.
  - `spacing`: `compact`, `normal` or `spacious`. `align`: `left` or `center` for the heading.
  - `eyebrow` (pill above the heading) and `titleAccent` (a second heading line in the brand colour).

Available now:

| `type` | What it shows |
| --- | --- |
| `hero` | Headline, text, two buttons, image. `variant`: `split`, `centered` or `spotlight` (dark band, uppercase serif headline with a highlighted second line `titleAccent`, `eyebrow`, ruled copy, `proof` line, glowing photo). `addToCartHandle` (and optional `addToCartVariant`) makes the main button add that product to the cart. Optional `mobileSrc` for a separate crop on phones |
| `benefits` | A row of short promises with icons. List only what the client really offers |
| `collectionGrid` | Tiles for the collection handles you list |
| `featuredProducts` | Products of one collection. Optional filter `tabs` (one collection each), `columns` (`2`, `3`, `4`) and `quickAdd` (Add to bag on each card; products with options show Choose) |
| `highlights` | A slim strip of short facts separated by dots |
| `featureBand` | A statement with icon items and an optional big number. `itemStyle`: `chips`, `outline`, `solid`, `cards`, `icons`, `list`; `columns` (`2`–`4`, `auto`); `iconShape`; `layout` `centered` or `split`. `stat`: typed, or `source: "shopifyOrders"` (needs `SHOPIFY_ADMIN_CLIENT_ID` + `SHOPIFY_ADMIN_CLIENT_SECRET` from a Dev Dashboard app with `read_orders`), rounded down with `roundDown`; `countUp` with `countSeconds` |
| `marquee` | Brand words scrolling across the page: own `font` (theme fonts or one of six bundled), `weight`, `italic`, `uppercase`, `textStyle` (outline/alternate), `size`, hex `backgroundColor`/`textColor`/`accentColor`, `separator`, `speed`, `direction`, `doubleRow`, `tilt` |
| `productSpotlight` | "Pick your favourite". `products` (Shopify handles with short `label`s) become choice buttons; the main button (`buttonLabel` with `{name}`, `priceInButton`) adds the chosen one; `showFromPrice`. Other half: `visual` `image` or `menu` (round tiles that add to the bag, `menu.items`, round `linkLabel` badge). `bundle`: a Shopify product priced as the bundle; visitors choose any `size` and the flavours are saved on the cart line. Custom hex `visualBackground`, `panelBackground`, `panelText`. Without `products`, `productHandle` shows one product's own options |
| `brandStatement` | One large sentence with an optional button |
| `imageText` | An image beside a heading, paragraph, optional small `cards` and a button. `imageFit`: `cover` or `contain` |
| `testimonials` | Customer quotes. Real customers only |
| `logoMarquee` | Partner or press names or logos: a `row` (optionally scrolling) or a small centred `card`. `highlight` on a name shows it in the brand colour, lowercase italic |
| `faq` | Questions and answers. `layout`: `stacked` or `split` (heading beside the questions) |
| `newsletter` | Email sign-up |
| `blogPosts` | The newest posts from a Shopify blog (`blogHandle`, default `news`). `layout`: `grid`, `featured` or `list`; `columns`; `tag` to show one topic; `showExcerpt`, `showDate`, `showAuthor`, `showTags`; `readMoreLabel` |
| `shopifyPage` | Text of a page written in Shopify (Online Store > Pages), whole or as an excerpt with Read more, optionally beside an image |

Sections that load Shopify data hide themselves if the data is empty or unavailable.

### Adding a section type

1. Add its config interface to `config/types.ts` and to the `SectionConfig` union.
2. Create the component in `components/sections/`.
3. Add a `case` in `components/sections/section-renderer.tsx`.

TypeScript reports an error until step 3 is done, so a section type can never be configured without a component.
