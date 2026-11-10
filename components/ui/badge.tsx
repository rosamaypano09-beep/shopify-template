import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "type-caption inline-flex items-center gap-1 rounded-control px-2.5 py-1 font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-foreground text-background",
        sale: "bg-accent text-accent-foreground",
        soldOut: "bg-background text-foreground ring-1 ring-foreground/25 ring-inset",
        success: "bg-success text-white",
        info: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
