"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Drawing height. The width follows the screen, so letters never grow with a wide window. */
const H = 220;

/** The line the text follows, drawn for a drawing `w` units wide (it starts and ends off-screen). */
const PATHS = {
  wave: (w: number) => `M -240 110 C ${w * 0.2} 40, ${w * 0.3} 180, ${w * 0.5} 110 S ${w * 0.8} 40, ${w + 240} 110`,
  arc: (w: number) => `M -240 165 Q ${w / 2} 20 ${w + 240} 165`,
  dip: (w: number) => `M -240 55 Q ${w / 2} 200 ${w + 240} 55`,
  straight: (w: number) => `M -240 110 L ${w + 240} 110`,
} as const;

/** Below this width (px) the line runs straight: a curve is too steep on a phone. */
const STRAIGHT_BELOW = 640;

/** Drawing units per second. */
const SPEEDS = { slow: 40, normal: 70, fast: 120 } as const;

/** How many times the run repeats, so it always covers the line while moving. */
const REPEATS = 12;

interface CurvedTextProps {
  parts: { text: string; separator: string }[];
  curve: Exclude<keyof typeof PATHS, "straight">;
  /** Run straight on phones. */
  straightOnPhones?: boolean;
  speed: keyof typeof SPEEDS;
  direction: "left" | "right";
  /** Font size in drawing units (the drawing is 220 tall). */
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  italic?: boolean;
  uppercase?: boolean;
  /** A band drawn under the words: the brand colour, the tinted surface, or none. */
  ribbon: "none" | "brand" | "surface";
  label: string;
}

/**
 * Text that flows along a curved line, looping without a seam. The drawing
 * is as wide as the screen and a fixed height, so the letters keep the same
 * size from phone to wide monitor. Visitors who prefer less motion, and themes
 * with animation off, get the same curve standing still.
 */
export function CurvedText({ parts, curve, straightOnPhones = true, speed, direction, fontSize, fontFamily, fontWeight, italic, uppercase, ribbon, label }: CurvedTextProps) {
  const pathId = `ce-curve-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const boxRef = useRef<HTMLDivElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const unitRef = useRef<SVGTextElement>(null);
  const [width, setWidth] = useState(1200);
  const [narrow, setNarrow] = useState(false);
  const shape = straightOnPhones && narrow ? "straight" : curve;

  // Match the drawing's width to the screen (in drawing units).
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: px, height: py } = entry.contentRect;
      if (px && py) setWidth(Math.round((px * H) / py));
      setNarrow(px < STRAIGHT_BELOW);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const textPath = textPathRef.current;
    const unit = unitRef.current;
    if (!textPath || !unit) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.animation === "none";
    // The length of one run of phrases: moving by exactly that much loops seamlessly.
    const runLength = unit.getComputedTextLength();
    if (still || !runLength) return;

    let frame = 0;
    let last = performance.now();
    let offset = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(textPath.ownerSVGElement ?? textPath);
    const tick = (now: number) => {
      const elapsed = Math.min(100, now - last);
      last = now;
      if (visible) {
        offset = (offset + (SPEEDS[speed] * elapsed) / 1000) % runLength;
        textPath.setAttribute("startOffset", (direction === "left" ? -offset : offset - runLength).toFixed(2));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [speed, direction]);

  const textStyle = {
    fontFamily,
    fontWeight,
    fontStyle: italic ? "italic" : undefined,
    textTransform: uppercase ? ("uppercase" as const) : undefined,
    letterSpacing: uppercase ? "0.06em" : undefined,
    fontSize,
  };
  const onBrand = ribbon === "brand";
  const run = (key: string) =>
    parts.map((part, index) => (
      <tspan key={`${key}-${index}`}>
        {part.text}
        <tspan className={onBrand ? "fill-primary-foreground/70" : "fill-highlight"} dx="18">
          {part.separator}
        </tspan>
        <tspan dx="18"> </tspan>
      </tspan>
    ));

  return (
    // Clips sideways only, so a ribbon can lie across the sections above and below.
    <div ref={boxRef} className={cn("relative [overflow-x:clip]", straightOnPhones ? "h-[4.5rem] sm:h-[clamp(7rem,5.25rem+5vw,10rem)]" : "h-[clamp(7rem,5.25rem+5vw,10rem)]")}>
      <p className="sr-only">{label}</p>
      <svg aria-hidden viewBox={`0 0 ${width} ${H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible">
        <path id={pathId} d={PATHS[shape](width)} fill="none" />
        {ribbon !== "none" ? (
          <use
            href={`#${pathId}`}
            fill="none"
            strokeWidth={fontSize * 1.85}
            className={cn("drop-shadow-xl", onBrand ? "stroke-primary" : "stroke-surface")}
          />
        ) : (
          // Without a ribbon, the curve itself shows as a faint guide line under the words.
          <use href={`#${pathId}`} className="stroke-primary/25" strokeWidth="1" fill="none" transform="translate(0 26)" />
        )}
        <text className={onBrand ? "fill-primary-foreground" : "fill-current"} style={textStyle} dominantBaseline="central">
          <textPath ref={textPathRef} href={`#${pathId}`} startOffset="0">
            {Array.from({ length: REPEATS }, (_, index) => run(String(index)))}
          </textPath>
        </text>
        {/* One run, invisible, only to measure its length. */}
        <text ref={unitRef} style={textStyle} opacity="0" x="-9999" y="-9999">
          {run("measure")}
        </text>
      </svg>
    </div>
  );
}
