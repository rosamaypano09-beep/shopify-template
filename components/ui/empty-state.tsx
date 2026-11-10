import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** The next step, usually a Button wrapping a Link. */
  action?: ReactNode;
  className?: string;
}

/** Shown when a list has nothing in it. Always offers a way forward. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-start gap-4 rounded-lg bg-surface p-8 sm:p-12", className)}>
      <h2 className="type-h3">{title}</h2>
      {description ? <p className="type-body max-w-[52ch] text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
