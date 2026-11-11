"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import type { Money } from "@/lib/shopify/types";

interface HeroAddToCartProps {
  merchandiseId: string;
  label: string;
  productTitle: string;
  variantTitle?: string;
  price: Money;
  className?: string;
}

/** The hero's main button when it is set to add one product straight to the cart. */
export function HeroAddToCart({ merchandiseId, label, productTitle, variantTitle, price, className }: HeroAddToCartProps) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onClick() {
    setAdding(true);
    setFailed(false);
    const ok = await add(merchandiseId, 1);
    setAdding(false);
    setFailed(!ok);
    if (ok) {
      track({
        name: "add_to_cart",
        currency: price.currencyCode,
        item: { id: merchandiseId, name: productTitle, variant: variantTitle, price: Number(price.amount), quantity: 1 },
      });
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button size="lg" onClick={onClick} loading={adding} className={className}>
        {label}
        <ArrowRight aria-hidden className="size-4" />
      </Button>
      {failed ? (
        <p role="alert" className="type-caption text-danger">
          That could not be added. Try again in a moment.
        </p>
      ) : null}
    </div>
  );
}
