"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { cn } from "@/lib/utils";

interface SortSelectProps {
  value: string;
  /** Each option carries the ready-made link for that sort order. */
  options: { value: string; label: string; href: string }[];
}

export function SortSelect({ value, options }: SortSelectProps) {
  const router = useRouter();
  const id = useId();
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("flex items-center gap-2", pending && "opacity-60")}>
      <label htmlFor={id} className="type-small text-muted">
        Sort by
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => {
            const next = options.find((option) => option.value === event.target.value);
            if (next) startTransition(() => router.push(next.href, { scroll: false }));
          }}
          className="h-11 cursor-pointer appearance-none rounded-control border border-foreground/25 bg-background pr-9 pl-4 text-[0.9375rem] font-medium hover:border-foreground"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
      </div>
    </div>
  );
}
