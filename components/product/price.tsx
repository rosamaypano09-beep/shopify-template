import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/shopify";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: Money;
  compareAtPrice?: Money | null;
  /** Prefix with "From" when variants are priced differently. */
  from?: boolean;
  locale: string;
  className?: string;
}

export function Price({ price, compareAtPrice, from, locale, className }: PriceProps) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="font-semibold tabular-nums">
        {from ? <span className="font-normal text-muted">From </span> : null}
        {compareAtPrice ? <span className="sr-only">Sale price </span> : null}
        {formatMoney(price, locale)}
      </span>
      {compareAtPrice ? (
        <span className="text-muted tabular-nums">
          <span className="sr-only">Original price </span>
          <s>{formatMoney(compareAtPrice, locale)}</s>
        </span>
      ) : null}
    </p>
  );
}
