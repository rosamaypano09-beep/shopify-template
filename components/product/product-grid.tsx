import { Skeleton } from "@/components/ui/skeleton";
import type { ProductSummary } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

const grid = "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4";

interface ProductGridProps {
  products: ProductSummary[];
  /** How many leading cards load eagerly (the first visible row). */
  priorityCount?: number;
  className?: string;
}

export function ProductGrid({ products, priorityCount = 0, className }: ProductGridProps) {
  return (
    <ul className={cn(grid, className)}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
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
