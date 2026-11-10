"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ShopImage } from "@/components/ui/shop-image";
import type { ShopImage as ShopImageData } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ShopImageData[];
  productTitle: string;
  ratio: "square" | "portrait" | "landscape";
  /** Scroll to this image when it changes, e.g. the selected variant's photo. */
  activeUrl?: string | null;
}

/**
 * Swipeable on touch screens (native scroll snapping, no library), with
 * thumbnails to jump between photos. Works with zero, one or many images.
 */
export function ProductGallery({ images, productTitle, ratio, activeUrl }: ProductGalleryProps) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (target: number, smooth = true) => {
    const element = track.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ left: target * element.clientWidth, behavior: smooth && !reduce ? "smooth" : "instant" });
  };

  useEffect(() => {
    if (!activeUrl) return;
    const target = images.findIndex((image) => image.url === activeUrl);
    if (target >= 0) goTo(target);
  }, [activeUrl, images]);

  if (images.length <= 1) {
    const image = images[0];
    return (
      <ShopImage
        src={image?.url}
        alt={image?.altText ?? productTitle}
        ratio={ratio}
        sizes="(min-width: 1024px) 52vw, 100vw"
        priority
        className="rounded-lg"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={track}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${productTitle} photos`}
        onScroll={(event) => {
          const element = event.currentTarget;
          setIndex(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, i) => (
          <div
            key={image.url}
            className="w-full shrink-0 snap-center"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${images.length}`}
          >
            <ShopImage
              src={image.url}
              alt={image.altText ?? `${productTitle}, photo ${i + 1}`}
              ratio={ratio}
              sizes="(min-width: 1024px) 52vw, 100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <ul className="grid grid-cols-6 gap-2 sm:gap-3">
        {images.map((image, i) => (
          <li key={image.url}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative block aspect-square w-full overflow-hidden rounded-md bg-surface ring-offset-2 ring-offset-background",
                i === index ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                unoptimized={image.url.endsWith(".svg")}
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
