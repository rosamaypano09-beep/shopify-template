import type { ThemePreset } from "../types";

/** Neutral and functional. Electronics, stationery, general retail. */
export const minimal: ThemePreset = {
  id: "minimal",
  label: "Minimal",
  suits: ["Electronics", "Gadgets", "Stationery", "Home Decor", "General Retail"],
  tokens: {
    colors: {
      background: "#FFFFFF",
      surface: "#F3F4F6",
      text: "#101418",
      textMuted: "#56606B",
      border: "#DADEE3",
      primary: "#1F3FD6",
      primaryForeground: "#FFFFFF",
      secondary: "#E7EBFB",
      secondaryForeground: "#13247A",
      accent: "#101418",
      accentForeground: "#FFFFFF",
      success: "#17734A",
      warning: "#8A5A00",
      danger: "#B42318",
    },
    typography: {
      headingWeight: 600,
      headingTracking: "-0.025em",
      headingLineHeight: 1.05,
      bodyLineHeight: 1.55,
      headingScale: 0.92,
    },
    radius: { sm: "4px", md: "8px", lg: "12px", control: "8px" },
    shadows: {
      sm: "0 1px 2px rgb(16 20 24 / 0.06)",
      md: "0 8px 20px -10px rgb(16 20 24 / 0.2)",
      lg: "0 24px 48px -24px rgb(16 20 24 / 0.3)",
    },
    spacing: {
      section: "clamp(3rem, 1.75rem + 5vw, 6rem)",
      container: "1280px",
      gutter: "clamp(1rem, 0.25rem + 3vw, 2.5rem)",
    },
    motion: {
      fast: "120ms",
      base: "200ms",
      slow: "400ms",
      ease: "cubic-bezier(0.2, 0, 0, 1)",
    },
  },
  variants: {
    productCard: "minimal",
    productImageRatio: "square",
    animation: "subtle",
    footer: "surface",
  },
};
