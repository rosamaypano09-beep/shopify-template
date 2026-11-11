import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShopImage } from "@/components/ui/shop-image";
import { discountPercent } from "@/lib/format";
import type { ProductSummary } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import type { ProductCardStyle } from "@/themes/types";
import { Price } from "./price";
import { QuickAddButton } from "./quick-add-button";
import { QuickViewButton } from "./quick-view";
import { Rating } from "./rating";
import { WishlistButton } from "./wishlist-button";

/**
 * One card, six looks. The active theme picks the style
 * (theme.variants.productCard); the markup and behaviour stay identical.
 */
const styles: Record<ProductCardStyle, { image: string; body: string; title: string; vendor: boolean }> = {
  minimal: { image: "rounded-sm", body: "gap-1 pt-3", title: "text-base font-medium", vendor: false },
  modern: { image: "rounded-lg", body: "gap-1.5 pt-4", title: "type-h4", vendor: false },
  editorial: { image: "rounded-none", body: "gap-2 pt-4", title: "type-h3", vendor: true },
  luxury: {
    image: "rounded-none",
    body: "items-center gap-1.5 pt-5 text-center [&_p]:justify-center",
    title: "type-h4",
    vendor: true,
  },
  compact: { image: "rounded-md", body: "gap-0.5 pt-2", title: "text-sm font-medium", vendor: false },
  "image-first": { image: "rounded-lg", body: "gap-1 pt-3", title: "text-base font-semibold", vendor: false },
};

export interface ProductCardLook {
  cardStyle: ProductCardStyle;
  imageRatio: "square" | "portrait" | "landscape";
  animation: "none" | "subtle" | "lively";
  locale: string;
  wishlist: boolean;
  quickView: boolean;
  reviews: boolean;
  /** Show an add-to-bag button under the price. Set per homepage section. */
  quickAdd?: { label: string } | null;
}

interface ProductCardViewProps {
  product: ProductSummary;
  look: ProductCardLook;
  /** Passed to the image so the browser picks the right file size for the grid. */
  sizes?: string;
  /** Load eagerly. Use for the first row above the fold only. */
  priority?: boolean;
}

/** The card itself. Takes its look as props, so it works on the server and in the browser. */
export function ProductCardView({
  product,
  look,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority,
}: ProductCardViewProps) {
  const style = styles[look.cardStyle];
  const discount = discountPercent(product.price, product.compareAtPrice);
  const still = look.animation === "none";

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative">
        <ShopImage
          src={product.featuredImage?.url}
          alt={product.featuredImage?.altText ?? product.title}
          ratio={look.imageRatio}
          sizes={sizes}
          priority={priority}
          className={style.image}
          imageClassName={cn(
            !still && "transition-transform duration-(--ce-motion-slow) ease-brand group-hover:scale-[1.04]",
            !product.availableForSale && "opacity-60",
          )}
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {!product.availableForSale ? (
            <Badge variant="soldOut">Sold out</Badge>
          ) : discount ? (
            <Badge variant="sale">Save {discount}%</Badge>
          ) : null}
        </div>
        {/* z-10 lifts these above the card's stretched link. */}
        {look.wishlist ? (
          <WishlistButton handle={product.handle} title={product.title} className="absolute top-2 right-2 z-10" />
        ) : null}
        {look.quickView ? (
          <QuickViewButton
            handle={product.handle}
            title={product.title}
            className="absolute inset-x-3 bottom-3 z-10 opacity-0 transition-opacity duration-(--ce-motion-fast) group-hover:opacity-100 focus-visible:opacity-100 max-lg:hidden"
          />
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col", style.body)}>
        {style.vendor && product.vendor ? <p className="type-caption text-muted">{product.vendor}</p> : null}
        <h3 className={style.title}>
          {/* The stretched link makes the whole card clickable with one tab stop. */}
          <Link
            href={`/products/${product.handle}`}
            className="underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-foreground"
          >
            {product.title}
          </Link>
        </h3>
        {look.reviews ? <Rating rating={product.rating} /> : null}
        {look.quickAdd ? (
          <div className="mt-auto flex flex-col items-stretch gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} from={product.hasPriceRange} locale={look.locale} />
            <QuickAddButton product={product} label={look.quickAdd.label} />
          </div>
        ) : (
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            from={product.hasPriceRange}
            locale={look.locale}
          />
        )}
      </div>
    </article>
  );
}
