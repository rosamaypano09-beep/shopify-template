import type { ThemePreset } from "../types";

/** Crisp, cool and compact. Electronics, gadgets, sports gear. */
export const tech: ThemePreset = {
  id: "tech",
  label: "Tech",
  suits: ["Electronics", "Gadgets", "Sports", "Automotive"],
  tokens: {
    colors: {
      background: "#F7F9FC",
      surface: "#E9EEF5",
      text: "#0B1220",
      textMuted: "#4A5568",
      border: "#D3DBE6",
      primary: "#0B5FFF",
      primaryForeground: "#FFFFFF",
      secondary: "#DCE8FF",
      secondaryForeground: "#062A75",
      accent: "#00C2A8",
      accentForeground: "#02231F",
      success: "#1F7A4D",
      warning: "#8A5A00",
      danger: "#B3261E",
    },
    typography: { headingWeight: 700, headingTracking: "-0.03em", headingLineHeight: 1.02, bodyLineHeight: 1.55, headingScale: 0.95 },
    radius: { sm: "6px", md: "10px", lg: "16px", control: "10px" },
    shadows: {
      sm: "0 1px 2px rgb(11 18 32 / 0.08)",
      md: "0 10px 24px -12px rgb(11 18 32 / 0.28)",
      lg: "0 28px 60px -28px rgb(11 18 32 / 0.45)",
    },
    spacing: { section: "clamp(3rem, 1.75rem + 5vw, 6.5rem)", container: "1360px", gutter: "clamp(1rem, 0.25rem + 3vw, 2.5rem)" },
    motion: { fast: "120ms", base: "200ms", slow: "420ms", ease: "cubic-bezier(0.2, 0, 0, 1)" },
  },
  variants: { productCard: "compact", productImageRatio: "square", animation: "subtle", footer: "primary" },
};
