import type { ThemePreset } from "./types";

const kebab = (value: string) => value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * Flattens theme tokens into the `--ce-*` custom properties that
 * app/globals.css maps onto Tailwind utilities. Set on <html>.
 */
export function themeToCssVars(theme: ThemePreset): Record<string, string> {
  const { colors, typography, radius, shadows, spacing, motion } = theme.tokens;
  const vars: Record<string, string> = {};

  for (const [name, value] of Object.entries(colors)) vars[`--ce-color-${kebab(name)}`] = value;
  for (const [name, value] of Object.entries(radius)) vars[`--ce-radius-${name}`] = value;
  for (const [name, value] of Object.entries(shadows)) vars[`--ce-shadow-${name}`] = value;
  for (const [name, value] of Object.entries(spacing)) vars[`--ce-space-${name}`] = value;
  for (const [name, value] of Object.entries(motion)) vars[`--ce-motion-${name}`] = value;

  vars["--ce-heading-weight"] = String(typography.headingWeight);
  vars["--ce-heading-tracking"] = typography.headingTracking;
  vars["--ce-heading-leading"] = String(typography.headingLineHeight);
  vars["--ce-body-leading"] = String(typography.bodyLineHeight);
  vars["--ce-heading-scale"] = String(typography.headingScale);

  return vars;
}
