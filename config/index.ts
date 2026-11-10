import { deepMerge } from "@/lib/merge";
import { isPresetId, resolveTheme, type ThemePreset } from "@/themes";
import { analyticsConfig } from "./analytics.config";
import { featuresConfig } from "./features.config";
import { homepageConfig } from "./homepage.config";
import { pagesConfig } from "./pages.config";
import { navigationConfig } from "./navigation.config";
import { seoConfig } from "./seo.config";
import savedOverrides from "./site.json";
import { storeConfig } from "./store.config";
import { themeConfig } from "./theme.config";
import type {
  AnalyticsConfig,
  FeaturesConfig,
  HomepageConfig,
  NavigationConfig,
  PagesConfig,
  SectionConfig,
  SeoConfig,
  StoreConfig,
} from "./types";

export interface SiteConfig {
  store: StoreConfig;
  theme: ThemePreset;
  features: FeaturesConfig;
  navigation: NavigationConfig;
  seo: SeoConfig;
  homepage: HomepageConfig;
  analytics: AnalyticsConfig;
  pages: PagesConfig;
}

/** Edits saved by the Store Builder dashboard. Sits on top of the *.config.ts files. */
interface SiteOverrides {
  store?: unknown;
  features?: unknown;
  navigation?: unknown;
  seo?: unknown;
  homepage?: { sections?: SectionConfig[] };
  theme?: { preset?: string; tokens?: unknown; variants?: unknown };
}

function resolvePreset(saved: SiteOverrides) {
  const fromEnv = process.env.THEME?.toLowerCase();
  if (fromEnv && isPresetId(fromEnv)) return fromEnv;
  if (saved.theme?.preset && isPresetId(saved.theme.preset)) return saved.theme.preset;
  return themeConfig.preset;
}

/**
 * The single entry point for client configuration. Components and pages call
 * this instead of importing config files directly.
 *
 * Order of precedence: config/site.json (dashboard edits) over the
 * *.config.ts files (defaults written in code).
 *
 * Multi-tenancy later: give this a `host` argument and look the config up
 * from a database. Nothing that calls it needs to know.
 */
export function getSiteConfig(): SiteConfig {
  return buildSiteConfig(savedOverrides as SiteOverrides);
}

/** The configuration for a given set of saved edits. The dashboard uses this to show unsaved-to-live state. */
export function buildSiteConfig(overrides: unknown): SiteConfig {
  const saved = (overrides ?? {}) as SiteOverrides;
  return {
    store: deepMerge(storeConfig, saved.store),
    theme: resolveTheme(
      resolvePreset(saved),
      deepMerge(themeConfig.overrides, { tokens: saved.theme?.tokens, variants: saved.theme?.variants }),
    ),
    features: deepMerge(featuresConfig, saved.features),
    navigation: deepMerge(navigationConfig, saved.navigation),
    seo: deepMerge(seoConfig, saved.seo),
    homepage: saved.homepage?.sections?.length ? { sections: saved.homepage.sections } : homepageConfig,
    analytics: analyticsConfig,
    pages: pagesConfig,
  };
}

export type * from "./types";
