import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page-view";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-site py-10 sm:py-14">
      <h1 className="type-h1 mb-8 sm:mb-12">Cart</h1>
      <CartPageView />
    </div>
  );
}
