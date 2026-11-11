import type { ThemePreset } from "../types";

/**
 * Ink-dark pages, a bright magenta accent and a heavy display serif.
 * Heritage food, patisserie, gifting, evening brands.
 * Designed with Playfair Display (headings) + Figtree (body).
 */
export const velvet: ThemePreset = {
  id: "velvet",
  label: "Velvet",
  suits: ["Patisserie", "Heritage food", "Gifting", "Evening"],
  tokens: {
    colors: {
      background: "#110A13",
      surface: "#1C1220",
      text: "#F7F0F8",
      textMuted: "#B8A6BD",
      border: "#34253A",
      primary: "#A42DB8",
      primaryForeground: "#FFFFFF",
      secondary: "#3A2342",
      secondaryForeground: "#F7E9FA",
      accent: "#8E27A0",
      accentForeground: "#FFFFFF",
      success: "#5FD39A",
      warning: "#F0C060",
      danger: "#FF8A80",
    },
    typography: { headingWeight: 800, headingTracking: "-0.015em", headingLineHeight: 0.98, bodyLineHeight: 1.6, headingScale: 1.0 },
    radius: { sm: "6px", md: "10px", lg: "18px", control: "999px" },
    shadows: {
      sm: "0 1px 2px rgb(0 0 0 / 0.3)",
      md: "0 12px 28px -12px rgb(0 0 0 / 0.55)",
      lg: "0 30px 70px -28px rgb(164 45 184 / 0.45)",
    },
    spacing: { section: "clamp(3.5rem, 2rem + 6vw, 8rem)", container: "1320px", gutter: "clamp(1rem, 0.25rem + 3.2vw, 3rem)" },
    motion: { fast: "140ms", base: "260ms", slow: "560ms", ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
  },
  variants: { productCard: "modern", productImageRatio: "square", animation: "subtle", footer: "surface" },
};
