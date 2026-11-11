"use client";

import { ChevronDown, Link2 } from "lucide-react";
import { createContext, useContext, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { LinkSuggestion } from "@/lib/dashboard/links";
import { cn } from "@/lib/utils";

const SuggestionsContext = createContext<LinkSuggestion[]>([]);

/** Makes the store's links (built-in pages and what exists in Shopify) available to every link field below it. */
export function LinkSuggestionsProvider({ suggestions, children }: { suggestions: LinkSuggestion[]; children: ReactNode }) {
  return <SuggestionsContext.Provider value={suggestions}>{children}</SuggestionsContext.Provider>;
}

const inputClass =
  "h-10 w-full rounded-control border border-border bg-background pr-9 pl-3 text-sm text-foreground hover:border-foreground/40";

/**
 * A link field with suggestions. Type a path or anything from a title
 * ("ube", "about"); pick with the mouse or the arrow keys and Enter.
 * Any other link starting with / or https:// can still be typed.
 */
export function LinkInput({
  id,
  value,
  onChange,
  onPick,
  describedBy,
  invalid,
  groups,
  handleMode,
  placeholder = "/collections/… or start typing a name",
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  /** Called with the whole suggestion, so a caller can also fill an empty label. */
  onPick?: (suggestion: LinkSuggestion) => void;
  describedBy?: string;
  invalid?: boolean;
  /** Only suggest these groups, for example ["Products"]. */
  groups?: string[];
  /** Store the handle (the last part of the link) instead of the whole link. */
  handleMode?: boolean;
  placeholder?: string;
}) {
  const everything = useContext(SuggestionsContext);
  const all = useMemo(() => {
    const list = groups ? everything.filter((s) => groups.includes(s.group)) : everything;
    return handleMode ? list.map((s) => ({ ...s, href: s.href.split("/").pop() ?? s.href })) : list;
  }, [everything, groups, handleMode]);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = term ? all.filter((s) => `${s.label} ${s.href}`.toLowerCase().includes(term)) : all;
    return list.slice(0, 60);
  }, [all, query]);
  const current = Math.min(active, Math.max(0, results.length - 1));
  const known = all.find((s) => s.href === value);

  function pick(suggestion: LinkSuggestion) {
    onChange(suggestion.href);
    onPick?.(suggestion);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <input
        id={id}
        value={value}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results.length ? `${listId}-${current}` : undefined}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        spellCheck={false}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open || !results.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive(Math.min(results.length - 1, current + 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(Math.max(0, current - 1));
          } else if (event.key === "Enter") {
            event.preventDefault();
            pick(results[current]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className={cn(inputClass, "font-mono text-xs aria-invalid:border-danger")}
      />
      <ChevronDown aria-hidden className="pointer-events-none absolute top-3 right-3 size-4 text-muted" />
      {known ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Link2 aria-hidden className="size-3" /> {known.group}: {known.label}
        </p>
      ) : null}
      {open && results.length ? (
        <ul
          id={listId}
          role="listbox"
          onMouseDown={() => blurTimer.current && clearTimeout(blurTimer.current)}
          className="absolute inset-x-0 top-11 z-30 max-h-72 overflow-y-auto rounded-md border border-border bg-background p-1 shadow-lg"
        >
          {results.map((suggestion, index) => (
            <li key={`${suggestion.group}:${suggestion.href}`}>
              {index === 0 || results[index - 1].group !== suggestion.group ? (
                <p className="px-2 pt-2 pb-1 text-[0.6875rem] font-semibold tracking-wide text-muted uppercase">{suggestion.group}</p>
              ) : null}
              <div
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === current}
                onPointerMove={() => setActive(index)}
                onClick={() => pick(suggestion)}
                className={cn(
                  "flex min-h-9 cursor-pointer items-center justify-between gap-3 rounded px-2 text-sm",
                  index === current && "bg-foreground/8",
                )}
              >
                <span className="truncate">{suggestion.label}</span>
                <span className="shrink-0 font-mono text-[0.6875rem] text-muted">{suggestion.href}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
