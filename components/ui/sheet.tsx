"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

interface SheetContentProps {
  /** Announced to screen readers and shown as the heading. */
  title: string;
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
}

/**
 * A drawer that slides in from the side. Radix handles focus trapping,
 * Escape to close, scroll lock and returning focus to the trigger.
 */
export function SheetContent({ title, side = "left", children, className }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/45 data-[state=closed]:animate-[ce-fade-out_var(--ce-motion-base)] data-[state=open]:animate-[ce-fade-in_var(--ce-motion-base)]" />
      <Dialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(24rem,calc(100vw-3rem))] flex-col bg-background text-foreground shadow-lg",
          "duration-(--ce-motion-base) ease-brand",
          side === "left"
            ? "left-0 data-[state=closed]:animate-[ce-slide-out-left_var(--ce-motion-base)_var(--ce-motion-ease)] data-[state=open]:animate-[ce-slide-in-left_var(--ce-motion-base)_var(--ce-motion-ease)]"
            : "right-0 data-[state=closed]:animate-[ce-slide-out-right_var(--ce-motion-base)_var(--ce-motion-ease)] data-[state=open]:animate-[ce-slide-in-right_var(--ce-motion-base)_var(--ce-motion-ease)]",
          className,
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Dialog.Title className="type-h4">{title}</Dialog.Title>
          <Dialog.Close
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-control hover:bg-foreground/8"
            aria-label="Close"
          >
            <X aria-hidden className="size-5" />
          </Dialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
