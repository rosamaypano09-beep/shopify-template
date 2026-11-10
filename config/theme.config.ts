import type { PresetId, ThemePreset } from "@/themes";
import type { DeepPartial } from "./types";

export interface ThemeConfig {
  /** Starting point. The THEME environment variable overrides this per deployment. */
  preset: PresetId;
  /** Anything set here wins over the preset. Leave empty to use the preset as designed. */
  overrides: DeepPartial<Pick<ThemePreset, "tokens" | "variants">>;
}

export const themeConfig: ThemeConfig = {
  preset: "organic",
  overrides: {
    // Example: tokens: { colors: { primary: "#0B5FFF" } },
  },
};
