import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const ratios = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  auto: "",
} as const;

const positions = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
} as const;

export interface ShopImageProps {
  /** Null or undefined renders the fallback instead of a broken image. */
  src: string | null | undefined;
  alt: string;
  ratio?: keyof typeof ratios;
  fit?: "cover" | "contain";
  position?: keyof typeof positions;
  /** Tells the browser how wide the image is at each breakpoint. Always set this. */
  sizes: string;
  /** Use for the largest image above the fold only. */
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

/**
 * Every storefront image goes through here: fixed aspect ratio (no layout
 * shift), never stretched, lazy by default, and a neutral fallback when
 * Shopify has no image for the item.
 */
export function ShopImage({
  src,
  alt,
  ratio = "square",
  fit = "cover",
  position = "center",
  sizes,
  priority = false,
  className,
  imageClassName,
}: ShopImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", ratios[ratio], className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          // SVGs are already resolution-independent; skip the optimizer for them.
          unoptimized={src.endsWith(".svg")}
          className={cn(fit === "cover" ? "object-cover" : "object-contain", positions[position], imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
          <ImageOff aria-hidden className="size-7" strokeWidth={1.5} />
          <span className="type-caption">{alt ? "No photo yet" : ""}</span>
        </div>
      )}
    </div>
  );
}
