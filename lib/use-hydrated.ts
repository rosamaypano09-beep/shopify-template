import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and while the component is hydrating, true afterwards.
 * Use it for anything that depends on browser-only state (such as the cart),
 * so the first client render always matches the server's HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
