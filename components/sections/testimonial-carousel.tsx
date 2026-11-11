"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Children, useRef, type ReactNode } from "react";

/** A swipeable row of cards that snaps into place, with arrow buttons on larger screens. */
export function TestimonialCarousel({ children, label }: { children: ReactNode; label: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    track.scrollBy({ left: direction * ((card?.getBoundingClientRect().width ?? track.clientWidth) + 24), behavior: "smooth" });
  };
  const arrow =
    "inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-highlight";

  return (
    <div className="flex flex-col gap-6">
      <ul
        ref={trackRef}
        aria-label={label}
        className="-mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-gutter pb-2 [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="w-[86%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">{child}</li>
        ))}
      </ul>
      <div className="flex justify-end gap-2 max-sm:hidden">
        <button type="button" onClick={() => scroll(-1)} aria-label="Previous" className={arrow}>
          <ArrowLeft aria-hidden className="size-4" />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="Next" className={arrow}>
          <ArrowRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
