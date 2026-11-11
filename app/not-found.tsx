import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { StoreChrome } from "@/components/layout/store-chrome";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/**
 * URLs that match no route at all. These skip the (store) layout, so the
 * header and footer are added here. Store pages that call notFound() use
 * app/(store)/not-found.tsx instead, which must NOT add them again.
 */
export default function NotFound() {
  return (
    <StoreChrome>
      <NotFoundContent />
    </StoreChrome>
  );
}
