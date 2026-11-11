"use client";

import { useEffect, useId, useRef } from "react";
import { parseStatValue } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CountUpProps {
  value: string;
  /** Seconds the count takes. */
  seconds?: number;
  locale: string;
  /** `speedBlur`: digits blur along their motion while they move fast and sharpen as the count slows. */
  effect?: "plain" | "speedBlur";
  /** How readily speed turns into blur. 1 is the default. */
  blurStrength?: number;
  /** Largest blur, in pixels. */
  maxBlur?: number;
  italic?: boolean;
  className?: string;
  /** Classes for the prefix and suffix around the number (for example a small accent "+"). */
  affixClassName?: string;
}

/** easeOutQuint: quick at first, then slower and slower until it lands. */
const ease = (t: number) => 1 - Math.pow(1 - t, 5);
/** Its speed at t, scaled to 0..1 (the curve is fastest, 5, at the start). */
const speedAt = (t: number) => Math.pow(1 - t, 4);

/**
 * Counts a number up from zero once it scrolls into view, slowing down as it
 * reaches the real figure. With the speed blur the digits smear vertically
 * in proportion to how fast they change, like a rolling counter, and settle
 * sharp on the final value.
 *
 * The real value is in the page from the start (search engines, screen
 * readers, no JavaScript). Visitors who ask for less motion, and themes with
 * animation turned off, just see it. Each frame writes straight to the
 * element, so React does not re-render 60 times a second.
 */
export function CountUp({
  value,
  seconds = 2.5,
  locale,
  effect = "speedBlur",
  blurStrength = 1,
  maxBlur = 12,
  italic = false,
  className,
  affixClassName,
}: CountUpProps) {
  const parsed = parseStatValue(value);
  const rootRef = useRef<HTMLSpanElement>(null);
  const digitsRef = useRef<HTMLSpanElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const filterId = `ce-speed-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const finalDigits = parsed
    ? new Intl.NumberFormat(locale, { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals }).format(parsed.number)
    : value;

  useEffect(() => {
    const root = rootRef.current;
    const digits = digitsRef.current;
    if (!parsed || !root || !digits) return;
    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.animation === "none";
    if (still) return;

    const format = new Intl.NumberFormat(locale, { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals });
    const blurNode = blurRef.current;
    const useBlur = effect === "speedBlur" && blurNode !== null && maxBlur > 0;
    const setBlur = (amount: number) => {
      if (!useBlur || !blurNode) return;
      // Vertical only: digits rolling past blur along their direction of travel.
      blurNode.setAttribute("stdDeviation", `0 ${amount.toFixed(2)}`);
      digits.style.filter = amount > 0.05 ? `url(#${filterId})` : "";
    };
    const show = (t: number) => {
      digits.textContent = format.format(t >= 1 ? parsed.number : parsed.number * ease(t));
      setBlur(t >= 1 ? 0 : Math.min(maxBlur, maxBlur * speedAt(t) * blurStrength));
    };
    // Waits as a sharp zero until it scrolls into view; the blur starts with the motion.
    digits.textContent = format.format(0);

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = Math.max(0.5, seconds) * 1000;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          show(t);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      digits.textContent = finalDigits;
      digits.style.filter = "";
    };
    // The value and its settings are fixed for the life of the section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, seconds, locale, effect, blurStrength, maxBlur]);

  if (!parsed) return <span className={className}>{value}</span>;

  return (
    <span ref={rootRef} className={cn("inline-flex items-start", className)}>
      {effect === "speedBlur" ? (
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter id={filterId} x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur ref={blurRef} stdDeviation="0 0" />
          </filter>
        </svg>
      ) : null}
      {/* Screen readers get the final number once, not every step of the count. */}
      <span aria-hidden className="inline-flex items-start">
        {parsed.prefix ? <span className={affixClassName}>{parsed.prefix}</span> : null}
        {/* An invisible copy of the final number holds the width, so nothing around it moves while it counts. */}
        <span className="inline-grid">
          <span className={cn("invisible col-start-1 row-start-1 tabular-nums", italic && "italic")}>{finalDigits}</span>
          <span ref={digitsRef} className={cn("col-start-1 row-start-1 text-right tabular-nums", italic && "italic")}>
            {finalDigits}
          </span>
        </span>
        {parsed.suffix ? <span className={affixClassName}>{parsed.suffix}</span> : null}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
