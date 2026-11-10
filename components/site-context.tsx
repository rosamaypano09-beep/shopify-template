"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FeaturesConfig } from "@/config/types";
import type { ProductCardStyle } from "@/themes/types";

/** The slice of site configuration that browser-side components need. */
export interface SiteSettings {
  locale: string;
  currency: string;
  features: FeaturesConfig;
  cardStyle: ProductCardStyle;
  imageRatio: "square" | "portrait" | "landscape";
  animation: "none" | "subtle" | "lively";
  /** False in the demo catalog, which has no checkout. */
  checkoutAvailable: boolean;
}

const SiteContext = createContext<SiteSettings | null>(null);

export function SiteProvider({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteSettings {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside <SiteProvider>.");
  return value;
}
