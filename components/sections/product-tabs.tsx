"use client";

import { Children, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Filter tabs over pre-rendered product grids. Arrow keys move between tabs. */
export function ProductTabs({ labels, children, align = "right" }: { labels: string[]; children: ReactNode; align?: "left" | "right" }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const panels = Children.toArray(children);

  return (
    <div className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-label="Filter products"
        className={cn("-mt-4 flex flex-wrap gap-2 sm:-mt-8", align === "right" ? "md:justify-end" : "justify-start")}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          const next = (active + (event.key === "ArrowRight" ? 1 : labels.length - 1)) % labels.length;
          setActive(next);
          document.getElementById(`${id}-tab-${next}`)?.focus();
        }}
      >
        {labels.map((label, index) => (
          <button
            key={`${label}-${index}`}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            className={cn(
              "min-h-10 rounded-control border px-4 text-sm font-semibold transition-colors duration-(--ce-motion-fast)",
              active === index ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted hover:border-foreground/50 hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div key={index} id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={active !== index}>
          {panel}
        </div>
      ))}
    </div>
  );
}
