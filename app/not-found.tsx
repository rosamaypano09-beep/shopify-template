import type { Metadata } from "next";
import Link from "next/link";
import { StoreChrome } from "@/components/layout/store-chrome";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <StoreChrome>
    <div className="container-site flex flex-col items-start gap-6 py-section">
      <h1 className="type-h1 max-w-[18ch]">We can&apos;t find that page.</h1>
      <p className="type-body-lg max-w-[50ch] text-muted">
        The link may be out of date, or the product may no longer be sold. Everything we currently stock is in the
        shop.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button asChild size="lg">
          <Link href="/collections">Browse the shop</Link>
        </Button>
        <Button asChild variant="link">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
    </StoreChrome>
  );
}
