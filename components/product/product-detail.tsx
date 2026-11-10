"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { QuantityStepper } from "@/components/cart/cart-contents";
import { useCart } from "@/components/cart/cart-provider";
import { useSite } from "@/components/site-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { buyNowAction } from "@/lib/cart/actions";
import {
  defaultVariant,
  findVariant,
  hasRealOptions,
  selectionOf,
  shortVariantId,
  valueState,
  variantFromShortId,
  type Selection,
} from "@/lib/catalog/variants";
import { discountPercent, formatMoney } from "@/lib/format";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { Price } from "./price";
import { ProductGallery } from "./product-gallery";
import { Rating } from "./rating";
import { WishlistButton } from "./wishlist-button";

const subscribeToNothing = () => () => {};

interface ProductDetailProps {
  product: Product;
  /** "page" is the full product page; "quickView" is the compact version shown in a dialog. */
  mode?: "page" | "quickView";
  /** Called after a successful add in quick view, so the dialog can close. */
  onAdded?: () => void;
  /** Server-rendered content shown under the buy box (description and so on). */
  children?: ReactNode;
}

/** Gallery, variant picker, quantity and the buy buttons. */
export function ProductDetail({ product, mode = "page", onAdded, children }: ProductDetailProps) {
  const { add, pending, error } = useCart();
  const site = useSite();
  const isPage = mode === "page";

  // A shared link such as /products/shirt?variant=123 opens on that variant.
  const urlVariantId = useSyncExternalStore(
    subscribeToNothing,
    () => (isPage ? new URLSearchParams(window.location.search).get("variant") : null),
    () => null,
  );
  const [chosen, setChosen] = useState<Selection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [addFailed, setAddFailed] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const buyRow = useRef<HTMLDivElement>(null);

  const initial = variantFromShortId(product, urlVariantId) ?? defaultVariant(product);
  const selection: Selection = chosen ?? (initial ? selectionOf(initial) : {});
  const variant = findVariant(product, selection);
  const showOptions = hasRealOptions(product);
  const adding = pending.has("add");
  const canBuy = Boolean(variant?.availableForSale);
  const price = variant?.price ?? product.price;
  const compareAt = variant ? variant.compareAtPrice : product.compareAtPrice;
  const discount = discountPercent(price, compareAt);
  const Heading = isPage ? "h1" : "h2";

  const analyticsItem = (qty: number) => ({
    id: variant?.id ?? product.id,
    name: product.title,
    variant: showOptions ? variant?.title : undefined,
    price: Number(price.amount),
    quantity: qty,
  });

  useEffect(() => {
    if (!isPage) return;
    track({
      name: "view_item",
      currency: product.price.currencyCode,
      item: { id: product.id, name: product.title, price: Number(product.price.amount), quantity: 1 },
    });
  }, [isPage, product]);

  // The sticky bar appears on phones once the main button has scrolled away.
  useEffect(() => {
    const element = buyRow.current;
    if (!element || !isPage || !site.features.stickyAddToCart) return;
    const observer = new IntersectionObserver(([entry]) => setButtonVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [isPage, site.features.stickyAddToCart]);

  function choose(optionName: string, value: string) {
    const next = { ...selection, [optionName]: value };
    setChosen(next);
    setTouched(true);
    setJustAdded(false);
    const picked = findVariant(product, next);
    if (picked && showOptions && isPage) {
      const url = new URL(window.location.href);
      url.searchParams.set("variant", shortVariantId(picked.id));
      window.history.replaceState(null, "", url);
    }
  }

  async function addToCart() {
    if (!variant?.availableForSale) return;
    setBuyError(null);
    const ok = await add(variant.id, quantity);
    setAddFailed(!ok);
    if (ok) {
      track({ name: "add_to_cart", currency: price.currencyCode, item: analyticsItem(quantity) });
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 2500);
      onAdded?.();
    }
  }

  async function buyNow() {
    if (!variant?.availableForSale) return;
    setBuying(true);
    setBuyError(null);
    const result = await buyNowAction({ merchandiseId: variant.id, quantity });
    if (result.ok) {
      track({
        name: "begin_checkout",
        currency: price.currencyCode,
        value: Number(price.amount) * quantity,
        itemCount: quantity,
      });
      window.location.assign(result.checkoutUrl);
    } else {
      setBuyError(result.error);
      setBuying(false);
    }
  }

  const problem = buyError ?? (addFailed ? error : null);
  const buttonLabel = !variant ? (
    "Not available in this combination"
  ) : !variant.availableForSale ? (
    "Sold out"
  ) : justAdded ? (
    <>
      <Check aria-hidden className="size-5" /> Added to cart
    </>
  ) : (
    "Add to cart"
  );

  return (
    <div
      className={cn(
        "grid gap-8",
        isPage ? "mt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16" : "md:grid-cols-2 md:gap-10",
      )}
    >
      <ProductGallery
        images={product.images}
        productTitle={product.title}
        ratio={site.imageRatio}
        activeUrl={touched ? variant?.image?.url : null}
      />

      <div
        className={cn(
          "flex flex-col gap-6",
          isPage && "lg:sticky lg:top-[calc(var(--ce-header-height)+2rem)] lg:self-start",
        )}
      >
        <div className="flex flex-col gap-3">
          {product.vendor ? <p className="type-small text-muted">{product.vendor}</p> : null}
          <Heading className={isPage ? "type-h1" : "type-h2"}>{product.title}</Heading>
          {site.features.reviews ? <Rating rating={product.rating} /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3" aria-live="polite">
          <Price price={price} compareAtPrice={compareAt} locale={site.locale} className="text-2xl" />
          {variant && !variant.availableForSale ? (
            <Badge variant="soldOut">Sold out</Badge>
          ) : discount ? (
            <Badge variant="sale">Save {discount}%</Badge>
          ) : null}
        </div>

        {showOptions
          ? product.options.map((option) => (
              <fieldset key={option.name}>
                <legend className="type-small mb-2">
                  <span className="font-semibold">{option.name}:</span> {selection[option.name]}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const state = valueState(product, selection, option.name, value);
                    const selected = selection[option.name] === value;
                    return (
                      <label
                        key={value}
                        className={cn(
                          "relative inline-flex min-h-11 cursor-pointer items-center rounded-control border px-4 text-[0.9375rem] font-medium",
                          "transition-colors duration-(--ce-motion-fast) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/25 hover:border-foreground",
                          state !== "available" && !selected && "text-muted",
                          state !== "available" && "line-through decoration-1",
                        )}
                      >
                        <input
                          type="radio"
                          name={`${mode}-option-${option.name}`}
                          value={value}
                          checked={selected}
                          onChange={() => choose(option.name, value)}
                          className="sr-only"
                        />
                        {value}
                        {state === "sold-out" ? <span className="sr-only"> (sold out)</span> : null}
                        {state === "missing" ? <span className="sr-only"> (not available)</span> : null}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))
          : null}

        <div className="flex flex-col gap-3">
          <div ref={buyRow} className="flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} onChange={setQuantity} disabled={!canBuy} label="Quantity" />
            <Button size="lg" className="min-w-48 flex-1" onClick={addToCart} loading={adding} disabled={!canBuy}>
              {buttonLabel}
            </Button>
          </div>
          {site.checkoutAvailable && canBuy && isPage ? (
            <Button size="lg" variant="outline" onClick={buyNow} loading={buying}>
              Buy now
            </Button>
          ) : null}
          <p role="status" className="sr-only">
            {justAdded ? `${product.title} added to cart.` : ""}
          </p>
          {problem ? (
            <p role="alert" className="type-small font-medium text-danger">
              {problem}
            </p>
          ) : null}
          {site.features.wishlist ? (
            <WishlistButton handle={product.handle} title={product.title} variant="text" />
          ) : null}
        </div>

        {isPage ? (
          children
        ) : (
          <Link
            href={`/products/${product.handle}`}
            className="inline-flex min-h-11 items-center self-start font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2"
          >
            View full details
          </Link>
        )}
      </div>

      {isPage && site.features.stickyAddToCart && !buttonVisible ? (
        <div className="fixed inset-x-0 bottom-(--ce-bottom-nav-height,0px) z-30 border-t border-border bg-background p-3 shadow-lg lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{product.title}</p>
              <p className="type-small text-muted tabular-nums">
                {showOptions && variant ? `${variant.title}, ` : ""}
                {formatMoney(price, site.locale)}
              </p>
            </div>
            <Button onClick={addToCart} loading={adding} disabled={!canBuy} className="shrink-0">
              {!variant ? "Unavailable" : !variant.availableForSale ? "Sold out" : justAdded ? "Added" : "Add to cart"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
