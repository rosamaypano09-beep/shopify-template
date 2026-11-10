import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "type-button relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control",
    "transition-[background-color,color,border-color,transform,box-shadow] duration-(--ce-motion-fast) ease-brand",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/88",
        accent: "bg-accent text-accent-foreground hover:bg-accent/85",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-foreground/25 bg-transparent text-foreground hover:border-foreground hover:bg-foreground/5",
        ghost: "bg-transparent text-foreground hover:bg-foreground/8",
        link: "h-auto rounded-none p-0 text-foreground underline decoration-1 underline-offset-4 hover:decoration-2",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6",
        lg: "h-14 px-8 text-base",
        icon: "size-11 p-0",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a Link) with button styling. */
  asChild?: boolean;
  /** Shows a spinner, keeps the width, and blocks repeat clicks. */
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="invisible contents">{children}</span>
          <LoaderCircle aria-hidden className="absolute size-5 animate-spin" />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
