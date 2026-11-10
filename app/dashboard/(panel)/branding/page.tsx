import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";
import type { Field } from "@/components/dashboard/fields";
import { presets } from "@/themes";

export const metadata: Metadata = { title: "Branding" };

const color = (key: string, label: string, hint?: string): Field => ({
  kind: "color",
  key: `theme.tokens.colors.${key}`,
  label,
  hint,
});

export default function BrandingPage() {
  return (
    <SettingsPage
      title="Branding"
      description="Pick a starting style, then adjust its colours. Fonts and logo files are set in config/fonts.ts and config/store.config.ts."
      groups={[
        {
          title: "Starting style",
          description: "A preset sets spacing, corners, type scale and motion. Saving a new preset keeps any colours you changed below; use Reset to take the preset's own colours.",
          columns: true,
          fields: [
            {
              kind: "select",
              key: "theme.preset",
              label: "Preset",
              options: Object.values(presets).map((preset) => ({
                value: preset.id,
                label: `${preset.label}: ${preset.suits.slice(0, 3).join(", ").toLowerCase()}`,
              })),
            },
          ],
        },
        {
          title: "Colours",
          description: "Each text colour sits on its partner. Keep pairs easy to read (contrast 4.5 or higher).",
          columns: true,
          fields: [
            color("primary", "Primary", "Main buttons, dark sections"),
            color("primaryForeground", "Text on primary"),
            color("accent", "Accent", "Announcement bar, sale badges"),
            color("accentForeground", "Text on accent"),
            color("background", "Page background"),
            color("text", "Text"),
            color("surface", "Tinted panels"),
            color("textMuted", "Secondary text"),
            color("secondary", "Secondary"),
            color("secondaryForeground", "Text on secondary"),
            color("border", "Lines and borders"),
          ],
        },
        {
          title: "Components",
          columns: true,
          fields: [
            {
              kind: "select",
              key: "theme.variants.productCard",
              label: "Product card style",
              options: ["minimal", "modern", "editorial", "luxury", "compact", "image-first"].map((value) => ({ value, label: value })),
            },
            {
              kind: "select",
              key: "theme.variants.productImageRatio",
              label: "Product image shape",
              options: [
                { value: "square", label: "Square" },
                { value: "portrait", label: "Portrait (4:5)" },
                { value: "landscape", label: "Landscape (4:3)" },
              ],
            },
            {
              kind: "select",
              key: "theme.variants.animation",
              label: "Animation",
              options: [
                { value: "lively", label: "Lively" },
                { value: "subtle", label: "Subtle" },
                { value: "none", label: "None" },
              ],
            },
            {
              kind: "select",
              key: "theme.variants.footer",
              label: "Footer",
              options: [
                { value: "primary", label: "Brand colour" },
                { value: "surface", label: "Light" },
              ],
            },
          ],
        },
      ]}
    />
  );
}
