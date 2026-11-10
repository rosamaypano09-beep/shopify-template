"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductAction } from "@/lib/catalog/actions";
import type { Product } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { ProductDetail } from "./product-detail";

type Loaded = { status: "loading" } | { status: "ready"; product: Product } | { status: "missing" };

/** "Quick view" on a product card: pick a variant and add to cart without leaving the list. */
export function QuickViewButton({ handle, title, className }: { handle: string; title: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<Loaded>({ status: "loading" });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next || state.status === "ready") return;
    setState({ status: "loading" });
    getProductAction(handle)
      .then((product) => setState(product ? { status: "ready", product } : { status: "missing" }))
      .catch(() => setState({ status: "missing" }));
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger
        aria-label={`Quick view: ${title}`}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-control bg-background/95 px-4 text-sm font-semibold text-foreground shadow-sm hover:bg-background",
          className,
        )}
      >
        Quick view
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/45 data-[state=closed]:animate-[ce-fade-out_var(--ce-motion-base)] data-[state=open]:animate-[ce-fade-in_var(--ce-motion-base)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[min(60rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-background p-6 text-foreground shadow-lg data-[state=open]:animate-[ce-fade-in_var(--ce-motion-base)] sm:p-8"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Close
            aria-label="Close quick view"
            className="absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-control bg-background hover:bg-foreground/8"
          >
            <X aria-hidden className="size-5" />
          </Dialog.Close>

          {state.status === "loading" ? (
            <div className="grid gap-8 md:grid-cols-2" role="status" aria-label="Loading product">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="flex flex-col gap-5">
                <Skeleton className="h-10 w-4/5" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          ) : state.status === "missing" ? (
            <p className="py-8 pr-10">This product couldn&apos;t be loaded. It may no longer be available.</p>
          ) : (
            <ProductDetail product={state.product} mode="quickView" onAdded={() => setOpen(false)} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
