import type { ThemePreset } from "../types";

/** Soft, light and rounded. Skincare, cosmetics, wellness. */
export const beauty: ThemePreset = {
  id: "beauty",
  label: "Beauty",
  suits: ["Beauty", "Skincare", "Wellness", "Gifts"],
  tokens: {
    colors: {
      background: "#FFF9F7",
      surface: "#F8E9E4",
      text: "#33211F",
      textMuted: "#6E5552",
      border: "#EBD3CC",
      primary: "#8C3B4A",
      primaryForeground: "#FFF9F7",
      secondary: "#F3D9D2",
      secondaryForeground: "#4A1F27",
      accent: "#C4A46B",
      accentForeground: "#2B1F0A",
      success: "#1F7A4D",
      warning: "#8A5A00",
      danger: "#B3261E",
    },
    typography: { headingWeight: 500, headingTracking: "-0.02em", headingLineHeight: 1.05, bodyLineHeight: 1.65, headingScale: 1.0 },
    radius: { sm: "10px", md: "18px", lg: "32px", control: "999px" },
    shadows: {
      sm: "0 1px 2px rgb(51 33 31 / 0.08)",
      md: "0 10px 24px -12px rgb(51 33 31 / 0.28)",
      lg: "0 28px 60px -28px rgb(51 33 31 / 0.45)",
    },
    spacing: { section: "clamp(3.75rem, 2rem + 6.5vw, 8rem)", container: "1320px", gutter: "clamp(1rem, 0.25rem + 3.2vw, 3rem)" },
    motion: { fast: "160ms", base: "280ms", slow: "600ms", ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
  },
  variants: { productCard: "modern", productImageRatio: "portrait", animation: "subtle", footer: "surface" },
};
