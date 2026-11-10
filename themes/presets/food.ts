import type { ThemePreset } from "../types";

/** Warm and appetising. Bakeries, cafes, restaurants, packaged food. */
export const food: ThemePreset = {
  id: "food",
  label: "Food",
  suits: ["Food", "Bakery", "Cafe", "Restaurant"],
  tokens: {
    colors: {
      background: "#FFFBF2",
      surface: "#F6EAD3",
      text: "#2A1A0F",
      textMuted: "#62503F",
      border: "#E3D2B5",
      primary: "#A3330F",
      primaryForeground: "#FFFBF2",
      secondary: "#F3DFA8",
      secondaryForeground: "#3D2A06",
      accent: "#2F6B3A",
      accentForeground: "#FFFFFF",
      success: "#1F7A4D",
      warning: "#8A5A00",
      danger: "#B3261E",
    },
    typography: { headingWeight: 700, headingTracking: "-0.025em", headingLineHeight: 1.0, bodyLineHeight: 1.6, headingScale: 1.0 },
    radius: { sm: "6px", md: "12px", lg: "20px", control: "12px" },
    shadows: {
      sm: "0 1px 2px rgb(42 26 15 / 0.08)",
      md: "0 10px 24px -12px rgb(42 26 15 / 0.28)",
      lg: "0 28px 60px -28px rgb(42 26 15 / 0.45)",
    },
    spacing: { section: "clamp(3.5rem, 2rem + 6vw, 7.5rem)", container: "1320px", gutter: "clamp(1rem, 0.25rem + 3.2vw, 3rem)" },
    motion: { fast: "140ms", base: "240ms", slow: "520ms", ease: "cubic-bezier(0.22, 1, 0.36, 1)" },
  },
  variants: { productCard: "modern", productImageRatio: "landscape", animation: "lively", footer: "primary" },
};
