import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { clearFilters, listingHref, toggleFilter, type ListingState } from "@/lib/catalog/params";
import type { ProductFilterGroup } from "@/lib/shopify";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  groups: ProductFilterGroup[];
  state: ListingState;
  path: string;
  defaultSort: string;
  currency: string;
  /** Keeps field ids unique when the panel is rendered twice (sidebar and drawer). */
  idPrefix: string;
}

/**
 * Renders whatever filters the store has enabled in Shopify. Every option is
 * a normal link and the price range is a normal form, so filtering works
 * without JavaScript and each filtered view has its own URL.
 */
export function FilterPanel({ groups, state, path, defaultSort, currency, idPrefix }: FilterPanelProps) {
  const hasActive = state.filterIds.length > 0 || state.min !== null || state.max !== null;

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) =>
        group.type === "PRICE_RANGE" ? (
          <form key={group.id} action={path} method="get" className="flex flex-col gap-3">
            <h3 className="font-semibold">{group.label}</h3>
            {state.sort !== defaultSort ? <input type="hidden" name="sort" value={state.sort} /> : null}
            {state.filterIds.map((id) => (
              <input key={id} type="hidden" name="f" value={id} />
            ))}
            <div className="flex items-end gap-2">
              {(["min", "max"] as const).map((bound) => (
                <div key={bound} className="flex min-w-0 flex-1 flex-col gap-1">
                  <label htmlFor={`${idPrefix}-${bound}`} className="type-caption text-muted">
                    {bound === "min" ? "From" : "To"} ({currency})
                  </label>
                  <input
                    id={`${idPrefix}-${bound}`}
                    name={bound}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    defaultValue={state[bound] ?? ""}
                    className="h-11 w-full rounded-control border border-foreground/25 bg-background px-3 text-base hover:border-foreground/50"
                  />
                </div>
              ))}
              <Button type="submit" variant="outline" size="sm" className="h-11">
                Apply
              </Button>
            </div>
          </form>
        ) : group.values.length ? (
          <div key={group.id} className="flex flex-col gap-1">
            <h3 className="mb-1 font-semibold">{group.label}</h3>
            <ul>
              {group.values.map((value) => {
                const selected = state.filterIds.includes(value.id);
                const empty = value.count === 0 && !selected;
                return (
                  <li key={value.id}>
                    <Link
                      href={listingHref(path, toggleFilter(state, value.id), defaultSort)}
                      scroll={false}
                      aria-current={selected ? "true" : undefined}
                      aria-disabled={empty || undefined}
                      tabIndex={empty ? -1 : undefined}
                      className={cn(
                        "group flex min-h-10 items-center gap-3 rounded-sm",
                        empty && "pointer-events-none opacity-45",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-[4px] border",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/40 group-hover:border-foreground",
                        )}
                      >
                        {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
                      </span>
                      <span className="flex-1">
                        {value.label}
                        {selected ? <span className="sr-only"> (selected, activate to remove)</span> : null}
                      </span>
                      <span className="type-small text-muted tabular-nums">{value.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null,
      )}

      {hasActive ? (
        <Link
          href={listingHref(path, clearFilters(state), defaultSort)}
          scroll={false}
          className="inline-flex min-h-10 items-center self-start font-semibold underline underline-offset-4"
        >
          Clear all filters
        </Link>
      ) : null}
    </div>
  );
}
