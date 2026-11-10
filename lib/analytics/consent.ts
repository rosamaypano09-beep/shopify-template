import { useSyncExternalStore } from "react";

/** The visitor's answer to the cookie banner, remembered in their browser. */
export type Consent = "granted" | "denied" | "undecided";

const KEY = "ce:consent";
const EVENT = "ce:consent";

function read(): Consent {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : "undecided";
  } catch {
    return "undecided";
  }
}

export function setConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Clears the stored answer so the banner asks again. Wire to a "Cookie settings" link. */
export function resetConsent() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** null on the server and during hydration, so nothing consent-dependent renders too early. */
export function useConsent(): Consent | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
