"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/** Filters in a slide-in drawer for phones and tablets. Closes when a filter link is followed. */
export function FilterDrawer({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-11 items-center gap-2 rounded-control border border-foreground/25 px-4 text-[0.9375rem] font-medium hover:border-foreground lg:hidden">
        <SlidersHorizontal aria-hidden className="size-4" />
        Filters{activeCount ? ` (${activeCount})` : ""}
      </SheetTrigger>
      <SheetContent title="Filters" side="left">
        <div
          className="p-5"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
