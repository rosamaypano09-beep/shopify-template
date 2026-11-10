import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href: string;
}

/** The last item is the current page. Also emits BreadcrumbList structured data. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("type-small text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {index > 0 ? <span aria-hidden>/</span> : null}
              {current ? (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="inline-flex min-h-8 items-center underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}
