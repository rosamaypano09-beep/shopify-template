import { useId, type InputHTMLAttributes, type Ref } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Hide the label visually while keeping it for screen readers. */
  hideLabel?: boolean;
  hint?: string;
  /** Sets the error state and is announced to screen readers. */
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, hideLabel, hint, error, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className={cn("type-small font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "h-12 w-full rounded-control border border-foreground/25 bg-background px-4 text-base text-foreground",
          "placeholder:text-muted transition-colors duration-(--ce-motion-fast)",
          "hover:border-foreground/50 focus-visible:border-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-danger",
          className,
        )}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="type-caption text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="type-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
