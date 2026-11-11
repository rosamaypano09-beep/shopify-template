import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProductSpotlightSectionConfig, SpotlightProductRef } from "@/config";
import { getSiteConfig } from "@/config";
import { ShopImage } from "@/components/ui/shop-image";
import { formatMoney } from "@/lib/format";
import { logger } from "@/lib/logger";
import { getProduct, type Product } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { FlavorPicker, type BundleOffer, type FlavorOption } from "./flavor-picker";
import { MenuTile, type MenuTileData } from "./menu-board";
import { ProductPicker } from "./product-picker";
import { Section } from "./section";

async function load(handle: string, sectionId: string): Promise<Product | null> {
  try {
    return await getProduct(handle);
  } catch (error) {
    logger.error("Product spotlight could not load a product", { scope: "sections", sectionId, handle, error });
    return null;
  }
}

/** Products in the configured order, skipping any that are missing in Shopify. */
async function loadAll(refs: SpotlightProductRef[] | undefined, sectionId: string) {
  const products = await Promise.all((refs ?? []).map((ref) => load(ref.handle, sectionId)));
  return (refs ?? []).flatMap((ref, index) => (products[index] ? [{ ref, product: products[index] as Product }] : []));
}

const firstForSale = (product: Product) => product.variants.find((variant) => variant.availableForSale) ?? null;

/**
 * Re-points the colour tokens inside a panel, so text, muted text, borders and
 * chips follow colours chosen in the dashboard (hex values from config).
 */
function panelColours(background?: string, text?: string): CSSProperties | undefined {
  if (!background && !text) return undefined;
  const style: Record<string, string> = {};
  if (background) {
    style.backgroundColor = background;
    style["--ce-color-background"] = background;
  }
  if (text) {
    style.color = text;
    style["--ce-color-text"] = text;
  }
  if (background && text) {
    style["--ce-color-text-muted"] = `color-mix(in oklab, ${text} 72%, ${background})`;
    style["--ce-color-border"] = `color-mix(in oklab, ${text} 22%, ${background})`;
    style["--ce-color-surface"] = `color-mix(in oklab, ${text} 6%, ${background})`;
  }
  return style as CSSProperties;
}

/**
 * "Pick your favourite": products chosen in the dashboard as flavour buttons
 * with a live-priced add button, beside a photo or a menu board of round
 * tiles that each add to the bag. An optional "choose any N" bundle uses a
 * Shopify product's own price. Everything priced or stocked comes from Shopify.
 */
export async function ProductSpotlight({ config }: { config: ProductSpotlightSectionConfig }) {
  const { store } = getSiteConfig();
  const locale = store.locale.language;
  const [chosen, menuItems, single, bundleProduct] = await Promise.all([
    loadAll(config.products, config.id),
    config.visual === "menu" ? loadAll(config.menu?.items, config.id) : Promise.resolve([]),
    !config.products?.length && config.productHandle ? load(config.productHandle, config.id) : Promise.resolve(null),
    config.bundle?.productHandle ? load(config.bundle.productHandle, config.id) : Promise.resolve(null),
  ]);
  if (!chosen.length && !single) return null;

  const options: FlavorOption[] = chosen.map(({ ref, product }) => {
    const variant = firstForSale(product);
    return {
      label: ref.label?.trim() || product.title,
      productTitle: product.title,
      handle: product.handle,
      variantId: variant?.id ?? null,
      price: variant?.price ?? product.price,
      imageUrl: product.featuredImage?.url ?? null,
    };
  });
  const forSale = options.filter((option) => option.variantId);
  const from = (forSale.length ? forSale : options).reduce<FlavorOption | null>(
    (lowest, option) => (!lowest || Number(option.price.amount) < Number(lowest.price.amount) ? option : lowest),
    null,
  );
  const bundleVariant = bundleProduct ? firstForSale(bundleProduct) : null;
  const bundle: BundleOffer | null =
    config.bundle && bundleProduct && bundleVariant && forSale.length
      ? {
          variantId: bundleVariant.id,
          productTitle: bundleProduct.title,
          price: bundleVariant.price,
          size: config.bundle.size,
          lead: config.bundle.lead,
          linkLabel: config.bundle.linkLabel,
        }
      : null;

  const tiles: MenuTileData[] = menuItems.map(({ ref, product }) => ({
    label: ref.label?.trim() || product.title,
    productTitle: product.title,
    handle: product.handle,
    imageUrl: product.featuredImage?.url ?? null,
    variantId: product.quickAddVariantId,
    available: product.availableForSale,
    price: product.price,
  }));

  const visualStyle = panelColours(config.visualBackground);
  const panelStyle = panelColours(config.panelBackground, config.panelText);
  const image =
    config.image ??
    (single?.featuredImage ? { src: single.featuredImage.url, alt: single.featuredImage.altText ?? single.title } : chosen[0]?.product.featuredImage ? { src: chosen[0].product.featuredImage.url, alt: chosen[0].product.featuredImage.altText ?? chosen[0].product.title } : null);
  const showMenu = config.visual === "menu" && tiles.length > 0;

  return (
    <Section config={config}>
      <div className="grid overflow-hidden rounded-[1.5rem] border border-border shadow-[0_40px_90px_-40px_color-mix(in_oklab,var(--color-primary)_55%,transparent)] sm:rounded-[2rem] lg:grid-cols-2">
        {/* The visual half: a menu board or a picture. Second on phones, so choosing comes first. */}
        <div
          style={visualStyle}
          className={cn(
            "relative order-2 flex min-w-0 items-center justify-center overflow-hidden px-4 py-10 sm:p-10 lg:order-none lg:p-12",
            !config.visualBackground && "ce-band-secondary",
            config.imageSide === "right" && "lg:order-2",
          )}
        >
          {/* A soft light behind the board. */}
          <div aria-hidden className="pointer-events-none absolute -top-1/4 -left-1/4 size-[80%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-primary-foreground)_35%,transparent),transparent)]" />
          {showMenu ? (
            <div
              style={panelStyle}
              className={cn(
                "relative w-full max-w-md rounded-2xl p-2 text-foreground shadow-lg",
                !config.panelBackground && "bg-background",
              )}
            >
              {/* A fine inner frame, like a printed menu card. */}
              <div className="rounded-xl border border-border px-3 pt-5 pb-6 sm:px-6 sm:pt-6 sm:pb-7">
                {config.menu?.title ? (
                  <div className="mb-5 flex items-center gap-3 sm:mb-6">
                    <p className="font-heading text-base font-bold tracking-[0.08em] uppercase sm:text-lg">{config.menu.title}</p>
                    <span aria-hidden className="h-px flex-1 bg-border" />
                  </div>
                ) : null}
                <ul className="grid grid-cols-3 gap-x-2.5 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-6">
                  {tiles.map((tile) => (
                    <li key={tile.handle}>
                      <MenuTile tile={tile} locale={locale} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : image ? (
            <ShopImage src={image.src} alt={image.alt} ratio="square" fit="contain" sizes="(min-width: 1024px) 45vw, 100vw" className="relative w-full max-w-lg bg-transparent" />
          ) : null}
          {config.menu?.linkHref && config.menu.linkLabel ? (
            <Link
              href={config.menu.linkHref}
              className="absolute top-3 right-3 inline-flex size-16 items-center justify-center rounded-full bg-primary p-2 text-center text-[0.5625rem] leading-tight font-bold tracking-[0.14em] text-primary-foreground uppercase shadow-lg ring-4 ring-primary/25 transition-transform hover:scale-105 sm:top-6 sm:right-6 sm:size-20 sm:text-[0.625rem]"
            >
              {config.menu.linkLabel}
            </Link>
          ) : null}
        </div>

        {/* The choosing half. */}
        <div
          style={panelStyle}
          className={cn("order-1 flex min-w-0 flex-col justify-center gap-4 px-5 py-9 text-foreground sm:gap-5 sm:p-10 lg:order-none lg:p-14", !config.panelBackground && "bg-surface")}
        >
          {config.eyebrow ? (
            <p className="type-caption flex items-center gap-3 font-semibold tracking-[0.2em] text-highlight uppercase">
              <span aria-hidden className="h-px w-8 bg-current" />
              {config.eyebrow}
            </p>
          ) : null}
          <h2 className="type-h1 max-sm:text-[2.35rem]">
            {config.title}
            {config.titleAccent ? <span className="block text-highlight italic">{config.titleAccent}</span> : null}
          </h2>
          {config.showFromPrice !== false && from && options.length ? (
            <p className="font-heading text-xl text-highlight italic sm:text-2xl">
              <span className="text-[0.75em] tracking-wide not-italic opacity-80">From </span>
              {formatMoney(from.price, locale)}
            </p>
          ) : null}
          {config.description ? <p className="type-body max-w-[52ch] text-muted">{config.description}</p> : null}
          <span aria-hidden className="my-1 h-px w-full bg-border" />
          {options.length ? (
            <FlavorPicker
              options={options}
              locale={locale}
              buttonLabel={config.buttonLabel || "Add {name} to bag"}
              priceInButton={config.priceInButton ?? true}
              bundle={bundle}
            />
          ) : single ? (
            <ProductPicker
              productTitle={single.title}
              productHandle={single.handle}
              options={single.options}
              variants={single.variants}
              locale={locale}
              buttonLabel={config.buttonLabel?.replace("{name}", single.title) || "Add to bag"}
            />
          ) : null}
          {config.showContact && (store.contact.phone || store.contact.email) ? (
            <p className="type-caption flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
              <span className="font-semibold tracking-[0.14em] uppercase">Order</span>
              {store.contact.phone ? (
                <a href={`tel:${store.contact.phone.replace(/\s+/g, "")}`} className="inline-flex min-h-8 items-center gap-1.5 hover:text-foreground">
                  <Phone aria-hidden className="size-3.5" /> {store.contact.phone}
                </a>
              ) : null}
              {store.contact.email ? (
                <a href={`mailto:${store.contact.email}`} className="inline-flex min-h-8 items-center gap-1.5 break-all hover:text-foreground">
                  <Mail aria-hidden className="size-3.5" /> {store.contact.email}
                </a>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
