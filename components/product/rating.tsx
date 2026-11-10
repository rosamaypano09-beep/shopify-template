import { Star } from "lucide-react";
import type { ProductRating } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** Average rating and review count. Renders nothing when the product has no reviews. */
export function Rating({ rating, className }: { rating: ProductRating | null; className?: string }) {
  if (!rating) return null;
  return (
    <p className={cn("type-small flex items-center gap-1.5", className)}>
      <Star aria-hidden className="size-4 fill-current text-accent" />
      <span className="font-semibold tabular-nums">{rating.value.toFixed(1)}</span>
      <span className="text-muted">
        <span className="sr-only">out of 5, from </span>({rating.count}
        <span className="sr-only"> {rating.count === 1 ? "review" : "reviews"}</span>)
      </span>
    </p>
  );
}
