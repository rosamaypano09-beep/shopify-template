import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSummary } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

const grid = "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4";
const columnClasses = {
  "2": "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2",
  "3": "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3",
  "4": grid,
} as const;

interface ProductGridProps {
  products: ProductSummary[];
  /** How many leading cards load eagerly (the first visible row). */
  priorityCount?: number;
  /** Cards per row on wide screens. */
  columns?: keyof typeof columnClasses;
  /** An add-to-bag button on each card. */
  quickAdd?: { label: string } | null;
  className?: string;
}

export function ProductGrid({ products, priorityCount = 0, columns = "4", quickAdd, className }: ProductGridProps) {
  const sizes = columns === "2" ? "(min-width: 640px) 50vw, 100vw" : columns === "3" ? "(min-width: 1024px) 33vw, 50vw" : undefined;
  return (
    <ul className={cn(columnClasses[columns], className)}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} quickAdd={quickAdd} sizes={sizes} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(grid, className)} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
