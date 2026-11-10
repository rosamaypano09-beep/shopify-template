import type { ThemePreset } from "../types";

/** Monochrome and image-led, with portrait photos. Clothing, accessories, footwear. */
export const fashion: ThemePreset = {
  id: "fashion",
  label: "Fashion",
  suits: ["Fashion", "Accessories", "Footwear"],
  tokens: {
    colors: {
      background: "#FFFFFF",
      surface: "#F2F2F0",
      text: "#0D0D0D",
      textMuted: "#5C5C5C",
      border: "#DCDCD8",
      primary: "#0D0D0D",
      primaryForeground: "#FFFFFF",
      secondary: "#EDEDEA",
      secondaryForeground: "#0D0D0D",
      accent: "#C8102E",
      accentForeground: "#FFFFFF",
      success: "#1F7A4D",
      warning: "#8A5A00",
      danger: "#B3261E",
    },
    typography: { headingWeight: 600, headingTracking: "-0.03em", headingLineHeight: 1.0, bodyLineHeight: 1.6, headingScale: 1.05 },
    radius: { sm: "0px", md: "2px", lg: "4px", control: "0px" },
    shadows: {
      sm: "0 1px 2px rgb(13 13 13 / 0.08)",
      md: "0 10px 24px -12px rgb(13 13 13 / 0.28)",
      lg: "0 28px 60px -28px rgb(13 13 13 / 0.45)",
    },
    spacing: { section: "clamp(4rem, 2.25rem + 7vw, 9rem)", container: "1480px", gutter: "clamp(1rem, 0.25rem + 3.2vw, 3.5rem)" },
    motion: { fast: "160ms", base: "280ms", slow: "620ms", ease: "cubic-bezier(0.16, 1, 0.3, 1)" },
  },
  variants: { productCard: "editorial", productImageRatio: "portrait", animation: "subtle", footer: "surface" },
};
