"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeaderShellProps {
  sticky: boolean;
  hideOnScroll: boolean;
  transparent: boolean;
  children: ReactNode;
}

/**
 * Scroll behaviour for the header: stays put, gains a border once the page
 * moves, and (optionally) slides away on the way down and back on the way up.
 */
export function HeaderShell({ sticky, hideOnScroll, transparent, children }: HeaderShellProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (!sticky) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (hideOnScroll) {
        const delta = y - lastY.current;
        // Ignore tiny movements so the header does not flicker.
        if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 240);
      }
      lastY.current = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sticky, hideOnScroll]);

  const overHero = transparent && pathname === "/" && !scrolled;

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "group/header relative z-40 border-b text-foreground",
        "transition-[transform,background-color,border-color] duration-(--ce-motion-base) ease-brand",
        sticky && "sticky top-0",
        overHero ? "border-transparent bg-transparent" : "bg-background",
        scrolled ? "border-border" : "border-transparent",
        // Keep the header in place while a keyboard user is inside it.
        hidden && "-translate-y-full focus-within:translate-y-0",
      )}
    >
      {children}
    </header>
  );
}
