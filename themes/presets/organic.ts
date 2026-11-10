import type { ThemePreset } from "../types";

/** Warm, friendly, rounded. Pet, wellness, food, baby. */
export const organic: ThemePreset = {
  id: "organic",
  label: "Organic",
  suits: ["Pet", "Wellness", "Food", "Baby", "Handmade"],
  tokens: {
    colors: {
      background: "#F6F7F1",
      surface: "#E8EDDA",
      text: "#17251C",
      textMuted: "#4C5A4E",
      border: "#CBD3BC",
      primary: "#1E4D3A",
      primaryForeground: "#F6F7F1",
      secondary: "#F4B8B0",
      secondaryForeground: "#3A1512",
      accent: "#F2C230",
      accentForeground: "#2B2205",
      success: "#1F7A4D",
      warning: "#8A5A00",
      danger: "#B3261E",
    },
    typography: {
      headingWeight: 700,
      headingTracking: "-0.035em",
      headingLineHeight: 0.98,
      bodyLineHeight: 1.55,
      headingScale: 1,
    },
    radius: { sm: "8px", md: "16px", lg: "28px", control: "999px" },
    shadows: {
      sm: "0 1px 2px rgb(23 37 28 / 0.08)",
      md: "0 10px 24px -12px rgb(23 37 28 / 0.25)",
      lg: "0 28px 60px -28px rgb(23 37 28 / 0.4)",
    },
    spacing: {
      section: "clamp(3.5rem, 2rem + 6vw, 7.5rem)",
      container: "1320px",
      gutter: "clamp(1rem, 0.25rem + 3.2vw, 3rem)",
    },
    motion: {
      fast: "140ms",
      base: "240ms",
      slow: "520ms",
      ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  },
  variants: {
    productCard: "modern",
    productImageRatio: "square",
    animation: "lively",
    footer: "primary",
  },
};
