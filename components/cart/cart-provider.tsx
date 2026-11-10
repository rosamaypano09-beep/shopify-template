"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  setDiscountCodesAction,
  updateCartLineAction,
  type CartResult,
} from "@/lib/cart/actions";
import type { Cart } from "@/lib/shopify/types";

export interface CartSettings {
  locale: string;
  /** Open the drawer after "Add to cart". When false, only the count updates. */
  openDrawerOnAdd: boolean;
  /** Promotional progress bar. Null hides it. */
  freeShippingThreshold: number | null;
  /** The threshold only makes sense in the store's own currency. */
  currency: string;
}

interface CartContextValue {
  cart: Cart | null;
  /** "loading" until the first read finishes. */
  status: "loading" | "ready";
  /** Line ids (or "add") with a change in flight. */
  pending: ReadonlySet<string>;
  /** The latest problem, written for the customer. Cleared by the next success. */
  error: string | null;
  settings: CartSettings;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (merchandiseId: string, quantity: number) => Promise<boolean>;
  update: (lineId: string, quantity: number) => Promise<boolean>;
  remove: (lineId: string) => Promise<boolean>;
  setDiscountCodes: (codes: string[]) => Promise<boolean>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>.");
  return value;
}

/**
 * Holds the cart for the whole site. The cart is loaded in the browser after
 * the page appears, so pages themselves stay cacheable and fast.
 */
export function CartProvider({ settings, children }: { settings: CartSettings; children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    getCartAction()
      .then((result) => {
        if (!mounted.current) return;
        // A transition lets React finish hydrating the header and page before
        // the cart count appears, instead of re-rendering them mid-hydration.
        startTransition(() => {
          if (result.ok) setCart(result.cart);
          setStatus("ready");
        });
      })
      .catch(() => mounted.current && startTransition(() => setStatus("ready")));
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (key: string, action: () => Promise<CartResult>) => {
    setPending((current) => new Set(current).add(key));
    let result: CartResult;
    try {
      result = await action();
    } catch {
      result = { ok: false, error: "We couldn't reach the store. Check your connection and try again." };
    }
    setPending((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    if (result.ok) {
      setCart(result.cart);
      setError(null);
    } else {
      setError(result.error);
    }
    return result.ok;
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      status,
      pending,
      error,
      settings,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add: async (merchandiseId, quantity) => {
        const ok = await run("add", () => addToCartAction({ merchandiseId, quantity }));
        if (ok && settings.openDrawerOnAdd) setDrawerOpen(true);
        return ok;
      },
      update: (lineId, quantity) => run(lineId, () => updateCartLineAction({ lineId, quantity })),
      remove: (lineId) => run(lineId, () => removeCartLineAction(lineId)),
      setDiscountCodes: (codes) => run("discount", () => setDiscountCodesAction(codes)),
    }),
    [cart, status, pending, error, settings, isDrawerOpen, run],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
