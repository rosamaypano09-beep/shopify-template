import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/config";
import { WishlistView } from "@/components/product/wishlist-view";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function WishlistPage() {
  if (!getSiteConfig().features.wishlist) notFound();
  return (
    <div className="container-site py-10 sm:py-14">
      <h1 className="type-h1 mb-3">Wishlist</h1>
      <p className="mb-8 text-muted sm:mb-12">Saved on this device. No account needed.</p>
      <WishlistView />
    </div>
  );
}
