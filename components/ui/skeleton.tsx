import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Placeholder block shown while content loads. Decorative: hidden from screen readers. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-foreground/8", className)} {...props} />;
}
