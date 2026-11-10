import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * A short list of strings (product handles) kept in the visitor's browser.
 * Used by the wishlist and "recently viewed". Nothing is sent to a server,
 * so it needs no account and no consent. Stays in sync across tabs.
 */

const EVENT = "ce:stored-list";
const EMPTY: readonly string[] = [];
const cache = new Map<string, { raw: string | null; list: readonly string[] }>();

function read(key: string): readonly string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY; // storage blocked (private mode, strict settings)
  }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.list;
  let list: readonly string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    list = EMPTY;
  }
  cache.set(key, { raw, list });
  return list;
}

function write(key: string, list: readonly string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useStoredList(key: string, max = 50) {
  const items = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );

  /** Puts the item first, removing any earlier copy. */
  const add = useCallback(
    (item: string) => write(key, [item, ...read(key).filter((other) => other !== item)].slice(0, max)),
    [key, max],
  );
  const remove = useCallback((item: string) => write(key, read(key).filter((other) => other !== item)), [key]);
  const toggle = useCallback(
    (item: string) => {
      const has = read(key).includes(item);
      if (has) remove(item);
      else add(item);
      return !has;
    },
    [key, add, remove],
  );

  return useMemo(() => ({ items, add, remove, toggle, has: (item: string) => items.includes(item) }), [items, add, remove, toggle]);
}

export const WISHLIST_KEY = "ce:wishlist";
export const RECENTLY_VIEWED_KEY = "ce:recently-viewed";
