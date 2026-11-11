"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { SECTION_ICON_GROUPS, sectionIcons } from "@/components/sections/icons";
import type { SectionIconName } from "@/lib/section-icons";
import { cn } from "@/lib/utils";

const label = (name: string) => name.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Shows the chosen icon; opens a searchable grid of every icon, grouped. */
export function IconPicker({ id, value, onChange }: { id: string; value: string; onChange: (next: SectionIconName) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const searchId = useId();
  const Current = sectionIcons[value as SectionIconName];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const term = query.trim().toLowerCase();

  return (
    <div ref={boxRef} className="relative">
      <button
        id={id}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center gap-2.5 rounded-control border border-border bg-background px-3 text-sm hover:border-foreground/40"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-md bg-foreground/8">
          {Current ? <Current aria-hidden className="size-4" /> : null}
        </span>
        <span className="flex-1 truncate text-left">{value ? label(value) : "Choose an icon"}</span>
        <ChevronDown aria-hidden className="size-4 text-muted" />
      </button>
      {open ? (
        <div
          className="absolute top-11 right-0 left-0 z-30 min-w-72 rounded-md border border-border bg-background p-3 shadow-lg"
          onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        >
          <label htmlFor={searchId} className="relative mb-2 block">
            <span className="sr-only">Search icons</span>
            <Search aria-hidden className="absolute top-2.5 left-2.5 size-4 text-muted" />
            <input
              id={searchId}
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search: cake, gift, truck…"
              className="h-9 w-full rounded-control border border-border bg-background pr-3 pl-8 text-sm"
            />
          </label>
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {Object.entries(SECTION_ICON_GROUPS).map(([group, names]) => {
              const shown = (names as readonly SectionIconName[]).filter((name) => !term || name.includes(term) || group.toLowerCase().includes(term));
              if (!shown.length) return null;
              return (
                <div key={group}>
                  <p className="mb-1.5 text-[0.6875rem] font-semibold tracking-wide text-muted uppercase">{group}</p>
                  <ul className="grid grid-cols-6 gap-1 sm:grid-cols-8">
                    {shown.map((name) => {
                      const Icon = sectionIcons[name];
                      return (
                        <li key={name}>
                          <button
                            type="button"
                            title={label(name)}
                            aria-label={label(name)}
                            aria-pressed={name === value}
                            onClick={() => {
                              onChange(name);
                              setOpen(false);
                              setQuery("");
                            }}
                            className={cn(
                              "inline-flex aspect-square w-full items-center justify-center rounded-md hover:bg-foreground/8",
                              name === value && "bg-primary text-primary-foreground hover:bg-primary",
                            )}
                          >
                            <Icon aria-hidden className="size-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
