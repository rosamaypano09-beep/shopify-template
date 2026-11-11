"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** A collection's description. On phones a long one is cut to four lines with Read more, so the products show sooner. */
export function CollectionIntro({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <div className="flex max-w-[56ch] flex-col items-start gap-1">
      <p className={cn("type-body-lg text-muted", long && !open && "max-sm:line-clamp-4")}>{text}</p>
      {long ? (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="type-small min-h-10 font-semibold underline underline-offset-4 sm:hidden">
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
