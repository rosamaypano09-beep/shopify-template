"use client";

import { Heart } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";
import { useStoredList, WISHLIST_KEY } from "@/lib/use-stored-list";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  handle: string;
  title: string;
  /** "icon" sits on product images; "text" is a labelled button for the product page. */
  variant?: "icon" | "text";
  className?: string;
}

export function WishlistButton({ handle, title, variant = "icon", className }: WishlistButtonProps) {
  const wishlist = useStoredList(WISHLIST_KEY);
  const saved = useHydrated() && wishlist.has(handle);

  const toggle = () => {
    if (wishlist.toggle(handle)) track({ name: "add_to_wishlist", handle, title });
  };

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 self-start font-medium underline-offset-4 hover:underline",
          className,
        )}
      >
        <Heart aria-hidden className={cn("size-5", saved && "fill-current")} strokeWidth={1.75} />
        {saved ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-background",
        className,
      )}
    >
      <Heart aria-hidden className={cn("size-[1.125rem]", saved && "fill-current")} strokeWidth={1.75} />
    </button>
  );
}
