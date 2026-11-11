"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { track } from "@/lib/analytics";
import type { ProductSummary } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

const pill =
  "relative z-10 inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-control px-4 py-2 text-center text-[0.8125rem] leading-tight font-semibold text-balance transition-colors duration-(--ce-motion-fast) sm:min-h-9 [&>svg]:shrink-0";

/**
 * The small button on a product card. One-variant products go straight into
 * the cart; products with options link to their page to choose.
 */
export function QuickAddButton({ product, label }: { product: ProductSummary; label: string }) {
  const { add } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  if (!product.availableForSale) return null;
  if (!product.quickAddVariantId) {
    return (
      <Link href={`/products/${product.handle}`} className={cn(pill, "border border-border hover:border-foreground/50")} aria-label={`Choose options for ${product.title}`}>
        Choose
      </Link>
    );
  }

  const variantId = product.quickAddVariantId;
  return (
    <button
      type="button"
      aria-label={`${label}: ${product.title}`}
      disabled={state === "adding"}
      onClick={async () => {
        setState("adding");
        const ok = await add(variantId, 1);
        setState(ok ? "added" : "idle");
        if (ok) {
          track({
            name: "add_to_cart",
            currency: product.price.currencyCode,
            item: { id: variantId, name: product.title, price: Number(product.price.amount), quantity: 1 },
          });
          window.setTimeout(() => setState("idle"), 2000);
        }
      }}
      className={cn(pill, "bg-primary text-primary-foreground hover:bg-primary/88")}
    >
      {state === "adding" ? <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> : state === "added" ? <Check aria-hidden className="size-3.5" /> : null}
      {state === "added" ? "Added" : label}
    </button>
  );
}
