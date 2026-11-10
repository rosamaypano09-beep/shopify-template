import type { ThemePreset } from "../types";

/** Quiet, high-contrast, sharp corners. Jewelry, fashion, fragrance. */
export const luxury: ThemePreset = {
  id: "luxury",
  label: "Luxury",
  suits: ["Jewelry", "Fashion", "Luxury", "Beauty", "Furniture"],
  tokens: {
    colors: {
      background: "#FFFFFF",
      surface: "#F1EEE8",
      text: "#14110F",
      textMuted: "#5F5850",
      border: "#DDD7CC",
      primary: "#14110F",
      primaryForeground: "#FFFFFF",
      secondary: "#F1EEE8",
      secondaryForeground: "#14110F",
      accent: "#7A5C2E",
      accentForeground: "#FFFFFF",
      success: "#2F6B4A",
      warning: "#8A5A00",
      danger: "#9B1C1C",
    },
    typography: {
      headingWeight: 500,
      headingTracking: "-0.01em",
      headingLineHeight: 1.04,
      bodyLineHeight: 1.65,
      headingScale: 1.08,
    },
    radius: { sm: "0px", md: "0px", lg: "0px", control: "0px" },
    shadows: {
      sm: "none",
      md: "0 12px 30px -18px rgb(20 17 15 / 0.3)",
      lg: "0 30px 70px -30px rgb(20 17 15 / 0.45)",
    },
    spacing: {
      section: "clamp(4.5rem, 2.5rem + 8vw, 10rem)",
      container: "1440px",
      gutter: "clamp(1.25rem, 0.5rem + 3.5vw, 4rem)",
    },
    motion: {
      fast: "180ms",
      base: "320ms",
      slow: "700ms",
      ease: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
  variants: {
    productCard: "luxury",
    productImageRatio: "portrait",
    animation: "subtle",
    footer: "surface",
  },
};
