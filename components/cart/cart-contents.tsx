"use client";

import { LoaderCircle, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopImage } from "@/components/ui/shop-image";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import type { Cart, CartLine } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-provider";

/** Shared by the cart drawer and the cart page. */

export function QuantityStepper({
  value,
  onChange,
  disabled,
  label,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
  max?: number;
}) {
  const button =
    "inline-flex size-10 items-center justify-center rounded-control hover:bg-foreground/8 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-control border border-foreground/25">
      <button
        type="button"
        className={button}
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden className="size-4" />
      </button>
      <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        className={button}
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden className="size-4" />
      </button>
    </div>
  );
}

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { update, remove, pending, settings } = useCart();
  const busy = pending.has(line.id);

  return (
    <li className={cn("flex gap-4 py-5", busy && "opacity-60")} aria-busy={busy || undefined}>
      <Link href={`/products/${line.productHandle}`} onClick={onNavigate} className="shrink-0" tabIndex={-1} aria-hidden>
        <ShopImage src={line.image?.url} alt="" sizes="96px" className="w-20 rounded-md sm:w-24" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${line.productHandle}`}
              onClick={onNavigate}
              className="inline-block py-1 font-semibold underline-offset-4 hover:underline"
            >
              {line.productTitle}
            </Link>
            {line.variantTitle ? <p className="type-small text-muted">{line.variantTitle}</p> : null}
            {!line.availableForSale ? (
              <p className="type-small font-medium text-danger">No longer available. Remove it to check out.</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              track({
                name: "remove_from_cart",
                currency: line.unitPrice.currencyCode,
                item: {
                  id: line.merchandiseId,
                  name: line.productTitle,
                  variant: line.variantTitle || undefined,
                  price: Number(line.unitPrice.amount),
                  quantity: line.quantity,
                },
              });
              void remove(line.id);
            }}
            disabled={busy}
            aria-label={`Remove ${line.productTitle}${line.variantTitle ? `, ${line.variantTitle}` : ""}`}
            className="-mt-2 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-control text-muted hover:bg-foreground/8 hover:text-foreground"
          >
            {busy ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <X aria-hidden className="size-4" />}
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <QuantityStepper
            value={line.quantity}
            disabled={busy}
            label={`Quantity for ${line.productTitle}`}
            onChange={(quantity) => update(line.id, quantity)}
          />
          <p className="text-right tabular-nums">
            <span className="font-semibold">{formatMoney(line.totalPrice, settings.locale)}</span>
            {line.quantity > 1 ? (
              <span className="type-caption block text-muted">
                {formatMoney(line.unitPrice, settings.locale)} each
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </li>
  );
}

/** Promotional only. Shopify decides the real shipping cost at checkout. */
export function FreeShippingBar({ cart }: { cart: Cart }) {
  const { settings } = useCart();
  const threshold = settings.freeShippingThreshold;
  if (!threshold || cart.subtotal.currencyCode !== settings.currency) return null;

  const subtotal = Number(cart.subtotal.amount);
  const remaining = Math.max(0, threshold - subtotal);
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const money = (amount: number) =>
    formatMoney({ amount: String(amount), currencyCode: settings.currency }, settings.locale);

  return (
    <div className="flex flex-col gap-2">
      <p className="type-small font-medium">
        {remaining > 0
          ? `Add ${money(remaining)} more for free shipping.`
          : "Your order qualifies for free shipping."}
      </p>
      <div
        role="progressbar"
        aria-label="Progress toward free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-foreground/12"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-(--ce-motion-slow) ease-brand"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function DiscountCodes({ cart }: { cart: Cart }) {
  const { setDiscountCodes, pending } = useCart();
  const [code, setCode] = useState("");
  const busy = pending.has("discount");
  const codes = cart.discountCodes.map((entry) => entry.code);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = code.trim();
    if (!value) return;
    if (await setDiscountCodes([...new Set([...codes, value])])) setCode("");
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Discount code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={60}
          />
        </div>
        <Button type="submit" variant="outline" loading={busy} disabled={!code.trim()}>
          Apply
        </Button>
      </form>
      {cart.discountCodes.length ? (
        <ul className="flex flex-col gap-1.5">
          {cart.discountCodes.map((entry) => (
            <li key={entry.code} className="type-small flex items-center justify-between gap-3">
              <span>
                <span className="font-semibold">{entry.code}</span>{" "}
                <span className={entry.applicable ? "text-success" : "text-danger"}>
                  {entry.applicable ? "applied" : "doesn't apply to this cart"}
                </span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => setDiscountCodes(codes.filter((other) => other !== entry.code))}
                className="inline-flex min-h-8 items-center underline underline-offset-4"
              >
                Remove<span className="sr-only"> code {entry.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CartTotals({ cart }: { cart: Cart }) {
  const { settings } = useCart();
  const discounted = Number(cart.total.amount) < Number(cart.subtotal.amount);

  return (
    <dl className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <dt className={discounted ? "text-muted" : "text-lg font-semibold"}>Subtotal</dt>
        <dd className={cn("tabular-nums", discounted ? "text-muted" : "text-lg font-semibold")}>
          {formatMoney(cart.subtotal, settings.locale)}
        </dd>
      </div>
      {discounted ? (
        <div className="flex items-baseline justify-between gap-4 text-lg font-semibold">
          <dt>After discounts</dt>
          <dd className="tabular-nums">{formatMoney(cart.total, settings.locale)}</dd>
        </div>
      ) : null}
      <p className="type-small text-muted">Shipping and taxes are calculated at checkout.</p>
    </dl>
  );
}

/** Hands the cart to Shopify's hosted checkout. Payment never touches this site. */
export function CheckoutButton({ cart }: { cart: Cart }) {
  const [leaving, setLeaving] = useState(false);
  const blocked = cart.lines.some((line) => !line.availableForSale);

  if (!cart.checkoutUrl) {
    return (
      <p className="type-small rounded-md bg-surface p-4">
        This is the demo catalog, so there is no checkout. Connect a Shopify store and this becomes the checkout
        button.
      </p>
    );
  }

  if (blocked) {
    return (
      <Button size="lg" className="w-full" disabled>
        Remove unavailable items to check out
      </Button>
    );
  }

  return (
    <a
      href={cart.checkoutUrl}
      onClick={() => {
        setLeaving(true);
        track({
          name: "begin_checkout",
          currency: cart.total.currencyCode,
          value: Number(cart.total.amount),
          itemCount: cart.totalQuantity,
        });
      }}
      aria-busy={leaving || undefined}
      className={cn(buttonVariants({ size: "lg" }), "w-full")}
    >
      {leaving ? (
        <>
          <LoaderCircle aria-hidden className="size-5 animate-spin" />
          Opening secure checkout
        </>
      ) : (
        "Check out"
      )}
    </a>
  );
}
