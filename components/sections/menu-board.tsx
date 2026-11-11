"use client";

import { Check, LoaderCircle, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export interface MenuTileData {
  label: string;
  productTitle: string;
  handle: string;
  imageUrl: string | null;
  /** Set when the product has one variant that is for sale: the tile adds it straight to the bag. */
  variantId: string | null;
  available: boolean;
  price: Money;
}

/** Two letters for a tile without a photo: "Ube Taro Pinipig" → "UT". */
const initials = (label: string) =>
  label
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

function Circle({ tile }: { tile: MenuTileData }) {
  return (
    <span className="relative block aspect-square w-full overflow-hidden rounded-full bg-primary/15 shadow-md">
      {tile.imageUrl ? (
        <Image src={tile.imageUrl} alt="" fill sizes="120px" className="object-cover" />
      ) : (
        <span className="type-h3 absolute inset-0 flex items-center justify-center text-highlight italic">{initials(tile.label)}</span>
      )}
    </span>
  );
}

/** One round tile. Adds to the bag in one tap, or opens the product when it has options. */
export function MenuTile({ tile, locale }: { tile: MenuTileData; locale: string }) {
  const { add } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const name = (
    <span className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-[0.75rem] leading-tight font-semibold">{tile.label}</span>
      <span className="text-[0.6875rem] text-muted">{tile.available ? formatMoney(tile.price, locale) : "Sold out"}</span>
    </span>
  );
  const badge = "absolute right-0 bottom-0 inline-flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-(--ce-motion-fast) group-hover/tile:scale-110";

  if (!tile.variantId) {
    return (
      <Link href={`/products/${tile.handle}`} className={cn("group/tile flex flex-col items-center gap-2", !tile.available && "opacity-55")}>
        <span className="relative w-full">
          <Circle tile={tile} />
        </span>
        {name}
      </Link>
    );
  }

  const variantId = tile.variantId;
  return (
    <button
      type="button"
      aria-label={`Add ${tile.label} to bag, ${formatMoney(tile.price, locale)}`}
      disabled={state === "adding"}
      onClick={async () => {
        setState("adding");
        const ok = await add(variantId, 1);
        setState(ok ? "added" : "idle");
        if (ok) {
          track({ name: "add_to_cart", currency: tile.price.currencyCode, item: { id: variantId, name: tile.productTitle, price: Number(tile.price.amount), quantity: 1 } });
          window.setTimeout(() => setState("idle"), 1800);
        }
      }}
      className="group/tile flex flex-col items-center gap-2"
    >
      <span className="relative w-full transition-transform duration-(--ce-motion-base) group-hover/tile:-translate-y-0.5">
        <Circle tile={tile} />
        <span aria-hidden className={badge}>
          {state === "adding" ? <LoaderCircle className="size-3.5 animate-spin" /> : state === "added" ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
        </span>
      </span>
      {name}
    </button>
  );
}
