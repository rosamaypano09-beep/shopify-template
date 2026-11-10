import type { DeepPartial } from "@/config/types";
import { beauty } from "./presets/beauty";
import { fashion } from "./presets/fashion";
import { food } from "./presets/food";
import { luxury } from "./presets/luxury";
import { midnight } from "./presets/midnight";
import { minimal } from "./presets/minimal";
import { organic } from "./presets/organic";
import { tech } from "./presets/tech";
import type { ThemePreset } from "./types";

export type { ThemePreset, ThemeTokens, ThemeVariants, ProductCardStyle } from "./types";

/** Add a preset: create a file in ./presets and register it here. */
export const presets = { organic, luxury, minimal, fashion, beauty, food, tech, midnight } satisfies Record<string, ThemePreset>;

export type PresetId = keyof typeof presets;

export function isPresetId(value: string): value is PresetId {
  return value in presets;
}

function merge<T>(base: T, overrides: DeepPartial<T> | undefined): T {
  if (!overrides) return base;
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    const current = result[key];
    result[key] =
      value && typeof value === "object" && !Array.isArray(value) && current && typeof current === "object"
        ? merge(current, value as DeepPartial<typeof current>)
        : value;
  }
  return result as T;
}

/** A preset with the client's overrides applied on top. */
export function resolveTheme(
  presetId: PresetId,
  overrides?: DeepPartial<Pick<ThemePreset, "tokens" | "variants">>,
): ThemePreset {
  const preset = presets[presetId];
  return {
    ...preset,
    tokens: merge(preset.tokens, overrides?.tokens),
    variants: merge(preset.variants, overrides?.variants),
  };
}
