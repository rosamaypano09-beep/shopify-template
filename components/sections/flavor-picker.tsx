"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** One choosable product, resolved from Shopify on the server. */
export interface FlavorOption {
  label: string;
  productTitle: string;
  handle: string;
  /** The variant to add, or null when sold out. */
  variantId: string | null;
  price: Money;
  imageUrl: string | null;
}

export interface BundleOffer {
  variantId: string;
  productTitle: string;
  price: Money;
  size: number;
  lead?: string;
  linkLabel: string;
}

interface FlavorPickerProps {
  options: FlavorOption[];
  locale: string;
  /** `{name}` is replaced by the chosen option. */
  buttonLabel: string;
  priceInButton: boolean;
  bundle: BundleOffer | null;
}

const fill = (template: string, name: string) => (template.includes("{name}") ? template.replace("{name}", name) : template);

/**
 * Choice chips for a few products (one per flavour), a main button that
 * names and prices the chosen one, and an optional "choose any N" bundle.
 * Prices and stock are Shopify's; the bundle's flavours are saved on its
 * cart line so they reach the order.
 */
export function FlavorPicker({ options, locale, buttonLabel, priceInButton, bundle }: FlavorPickerProps) {
  const { add } = useCart();
  const [chosen, setChosen] = useState(() => Math.max(0, options.findIndex((option) => option.variantId)));
  const [adding, setAdding] = useState(false);
  const [state, setState] = useState<"idle" | "added" | "failed">("idle");
  const option = options[chosen];

  async function addChosen() {
    if (!option?.variantId) return;
    setAdding(true);
    const ok = await add(option.variantId, 1);
    setAdding(false);
    setState(ok ? "added" : "failed");
    if (ok) {
      track({ name: "add_to_cart", currency: option.price.currencyCode, item: { id: option.variantId, name: option.productTitle, price: Number(option.price.amount), quantity: 1 } });
      window.setTimeout(() => setState("idle"), 2500);
    }
  }

  const label = !option?.variantId
    ? `${option?.label ?? "This one"} is sold out`
    : state === "added"
      ? "Added to bag"
      : `${fill(buttonLabel, option.label)}${priceInButton ? ` · ${formatMoney(option.price, locale)}` : ""}`;

  return (
    <div className="flex w-full flex-col gap-5">
      <div role="radiogroup" aria-label="Choose a flavour" className="flex flex-wrap gap-2">
        {options.map((entry, index) => (
          <button
            key={entry.handle}
            type="button"
            role="radio"
            aria-checked={index === chosen}
            onClick={() => {
              setChosen(index);
              setState("idle");
            }}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-[background-color,border-color,color,box-shadow] duration-(--ce-motion-fast) sm:px-4 sm:text-sm",
              index === chosen
                ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_20px_-10px_var(--color-primary)]"
                : "border-border bg-background/40 hover:border-foreground/60",
              !entry.variantId && "line-through decoration-1 opacity-60",
            )}
          >
            {index === chosen ? <Check aria-hidden className="size-3.5" /> : null}
            {entry.label}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        onClick={addChosen}
        loading={adding}
        disabled={!option?.variantId}
        className="w-full text-[0.8125rem] tracking-[0.08em] uppercase shadow-[0_14px_30px_-14px_var(--color-primary)] sm:min-h-14 sm:text-sm sm:tracking-[0.12em]"
      >
        {state === "added" ? <Check aria-hidden className="size-4" /> : <ShoppingBag aria-hidden className="size-4" />}
        {label}
      </Button>
      {state === "failed" ? (
        <p role="alert" className="type-caption text-danger">
          That could not be added. Try again in a moment.
        </p>
      ) : null}

      {bundle ? <BundleDialog bundle={bundle} options={options.filter((entry) => entry.variantId)} locale={locale} /> : null}
    </div>
  );
}

const initials = (label: string) =>
  label
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

function Thumb({ option, size = "md" }: { option: FlavorOption; size?: "sm" | "md" }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-full bg-primary/15 ring-2 ring-background", size === "sm" ? "size-9" : "size-12")}>
      {option.imageUrl ? (
        <Image src={option.imageUrl} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-heading text-sm text-highlight italic">{initials(option.label)}</span>
      )}
    </span>
  );
}

/**
 * "Choose any N": a bottom sheet on phones, a centred dialog on larger
 * screens. Slots at the top fill as flavours are picked; Add to bag stays off
 * until exactly N are chosen. Repeats are allowed.
 */
function BundleDialog({ bundle, options, locale }: { bundle: BundleOffer; options: FlavorOption[]; locale: string }) {
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const [failed, setFailed] = useState(false);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const left = bundle.size - total;
  const price = formatMoney(bundle.price, locale);
  // One entry per chosen piece, in the order of the list, to fill the slots.
  const slots = options.flatMap((option) => Array.from({ length: counts[option.handle] ?? 0 }, () => option));

  async function addBundle() {
    const picked = options.filter((entry) => counts[entry.handle]).map((entry) => `${entry.label} ×${counts[entry.handle]}`);
    setAdding(true);
    setFailed(false);
    const ok = await add(bundle.variantId, 1, [{ key: "Flavours", value: picked.join(", ") }]);
    setAdding(false);
    if (ok) {
      track({ name: "add_to_cart", currency: bundle.price.currencyCode, item: { id: bundle.variantId, name: bundle.productTitle, price: Number(bundle.price.amount), quantity: 1 } });
      setOpen(false);
      setCounts({});
    } else setFailed(true);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="group/trio flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/45 bg-primary/5 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/10">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-highlight">
          <Sparkles aria-hidden className="size-4" />
        </span>
        <span className="type-small min-w-0 flex-1">
          {bundle.lead ? <span className="block text-muted">{bundle.lead}</span> : null}
          <span className="font-semibold">
            {bundle.linkLabel} for {price}
          </span>
        </span>
        <ArrowRight aria-hidden className="size-4 shrink-0 transition-transform group-hover/trio:translate-x-0.5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ce-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "ce-sheet fixed z-50 flex flex-col overflow-hidden border border-border bg-background text-foreground shadow-lg",
            // Phones: a sheet from the bottom. Larger screens: a centred dialog.
            "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[1.75rem] pb-[env(safe-area-inset-bottom)]",
            "sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[min(32rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.5rem] sm:pb-0",
          )}
        >
          <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/20 sm:hidden" />
          <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:px-7 sm:pt-7">
            <div className="min-w-0">
              <p className="type-caption font-semibold tracking-[0.2em] text-highlight uppercase">Choose any {bundle.size}</p>
              <Dialog.Title className="type-h3 mt-1">{bundle.productTitle}</Dialog.Title>
              <Dialog.Description className="type-small mt-1 text-muted">
                One price, {price}. Repeats are welcome.
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Close" className="-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-foreground/8">
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          {/* Slots that fill as flavours are chosen. */}
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl bg-surface px-4 py-3 sm:mx-7" aria-hidden>
            <div className="flex -space-x-2">
              {Array.from({ length: bundle.size }, (_, index) =>
                slots[index] ? (
                  <Thumb key={index} option={slots[index]} size="sm" />
                ) : (
                  <span key={index} className="block size-9 rounded-full border-2 border-dashed border-border bg-background" />
                ),
              )}
            </div>
            <p className="type-small font-semibold">
              {total} of {bundle.size} chosen
            </p>
          </div>

          <ul className="mt-2 flex-1 divide-y divide-border overflow-y-auto overscroll-contain px-5 sm:px-7">
            {options.map((entry) => {
              const count = counts[entry.handle] ?? 0;
              return (
                <li key={entry.handle} className="flex min-h-[4.25rem] items-center gap-3 py-2.5">
                  <Thumb option={entry} />
                  <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">{entry.label}</span>
                  <span className={cn("flex items-center rounded-full border transition-colors", count ? "border-primary bg-primary/8" : "border-border")}>
                    <button
                      type="button"
                      aria-label={`One less ${entry.label}`}
                      disabled={!count}
                      onClick={() => setCounts({ ...counts, [entry.handle]: count - 1 })}
                      className="inline-flex size-10 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <Minus aria-hidden className="size-4" />
                    </button>
                    <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">
                      {count}
                    </span>
                    <button
                      type="button"
                      aria-label={`One more ${entry.label}`}
                      disabled={left <= 0}
                      onClick={() => setCounts({ ...counts, [entry.handle]: count + 1 })}
                      className="inline-flex size-10 items-center justify-center rounded-full disabled:opacity-30"
                    >
                      <Plus aria-hidden className="size-4" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3 border-t border-border bg-background px-5 py-4 sm:px-7 sm:py-5">
            <p role="status" className="type-small min-w-0 flex-1 text-muted">
              {left > 0 ? (
                <>
                  <span className="font-semibold text-foreground">
                    {total} of {bundle.size}
                  </span>{" "}
                  chosen
                </>
              ) : (
                <span className="font-semibold text-foreground">Ready · {price}</span>
              )}
            </p>
            <Button disabled={left !== 0} loading={adding} onClick={addBundle} className="tracking-[0.1em] uppercase">
              <ShoppingBag aria-hidden className="size-4" /> Add to bag
            </Button>
          </div>
          {failed ? (
            <p role="alert" className="type-caption px-5 pb-4 text-danger sm:px-7">
              That could not be added. Try again in a moment.
            </p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
