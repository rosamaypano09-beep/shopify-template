"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import { track } from "@/lib/analytics";
import type { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

interface ProductPickerProps {
  productTitle: string;
  productHandle: string;
  options: ProductOption[];
  variants: ProductVariant[];
  locale: string;
  buttonLabel: string;
}

const findVariant = (variants: ProductVariant[], selected: Record<string, string>) =>
  variants.find((variant) => variant.selectedOptions.every((option) => selected[option.name] === option.value)) ?? null;

/** Option buttons, live price and add to cart for one product. Stock and price are Shopify's. */
export function ProductPicker({ productTitle, productHandle, options, variants, locale, buttonLabel }: ProductPickerProps) {
  const { add } = useCart();
  const initial = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries((initial?.selectedOptions ?? []).map((option) => [option.name, option.value])),
  );
  const [adding, setAdding] = useState(false);
  const [state, setState] = useState<"idle" | "added" | "failed">("idle");
  const variant = findVariant(variants, selected);
  // Shopify gives single-variant products one option called "Title" with the value "Default Title".
  const choices = options.filter((option) => option.values.length > 1);

  async function addToCart() {
    if (!variant?.availableForSale) return;
    setAdding(true);
    const ok = await add(variant.id, 1);
    setAdding(false);
    setState(ok ? "added" : "failed");
    if (ok) {
      track({
        name: "add_to_cart",
        currency: variant.price.currencyCode,
        item: { id: variant.id, name: productTitle, variant: choices.length ? variant.title : undefined, price: Number(variant.price.amount), quantity: 1 },
      });
      window.setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      {choices.map((option) => (
        <fieldset key={option.name} className="flex flex-col gap-2.5">
          <legend className="type-caption mb-2 font-semibold tracking-[0.14em] text-muted uppercase">{option.name}</legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const next = { ...selected, [option.name]: value };
              const candidate = findVariant(variants, next);
              const active = selected[option.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelected(next);
                    setState("idle");
                  }}
                  className={cn(
                    "min-h-10 rounded-control border px-4 text-sm font-medium transition-colors duration-(--ce-motion-fast)",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/50",
                    !candidate?.availableForSale && "text-muted line-through decoration-1",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {variant ? <Price price={variant.price} compareAtPrice={variant.compareAtPrice} locale={locale} className="type-h3" /> : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button size="lg" onClick={addToCart} loading={adding} disabled={!variant?.availableForSale} className="min-w-52">
          {state === "added" ? <Check aria-hidden className="size-4" /> : <ShoppingBag aria-hidden className="size-4" />}
          {!variant?.availableForSale ? "Sold out" : state === "added" ? "Added" : buttonLabel}
        </Button>
        <SiteLink href={`/products/${productHandle}`} className="type-small font-semibold underline underline-offset-4">
          Full details
        </SiteLink>
      </div>
      <p role="status" className="type-caption text-danger empty:hidden">
        {state === "failed" ? "That could not be added. Try again in a moment." : ""}
      </p>
    </div>
  );
}
