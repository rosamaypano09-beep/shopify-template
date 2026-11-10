import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ShopImage } from "@/components/ui/shop-image";
import type { Collection } from "@/lib/shopify";

interface CollectionCardProps {
  collection: Collection;
  sizes?: string;
}

export function CollectionCard({
  collection,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw",
}: CollectionCardProps) {
  return (
    <article className="group relative flex flex-col gap-3">
      <ShopImage
        src={collection.image?.url}
        alt={collection.image?.altText ?? ""}
        ratio="portrait"
        sizes={sizes}
        className="rounded-lg"
        imageClassName="transition-transform duration-(--ce-motion-slow) ease-brand group-hover:scale-[1.04]"
      />
      <div className="flex items-start justify-between gap-3">
        <h3 className="type-h4">
          <Link
            href={`/collections/${collection.handle}`}
            className="underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-foreground"
          >
            {collection.title}
          </Link>
        </h3>
        <ArrowUpRight
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-muted transition-transform duration-(--ce-motion-base) ease-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
        />
      </div>
    </article>
  );
}
