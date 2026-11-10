import type { ThemePreset } from "../types";

/** Dark background with bright accents. Streetwear, gaming, nightlife, premium tech. */
export const midnight: ThemePreset = {
  id: "midnight",
  label: "Midnight",
  suits: ["Gaming", "Streetwear", "Premium tech"],
  tokens: {
    colors: {
      background: "#0E0F13",
      surface: "#191B22",
      text: "#F2F3F5",
      textMuted: "#A3A8B4",
      border: "#2C2F3A",
      primary: "#F2F3F5",
      primaryForeground: "#0E0F13",
      secondary: "#252836",
      secondaryForeground: "#E3E6F0",
      accent: "#C6F432",
      accentForeground: "#141A00",
      success: "#5FD39A",
      warning: "#F0C060",
      danger: "#FF8A80",
    },
    typography: { headingWeight: 700, headingTracking: "-0.03em", headingLineHeight: 1.0, bodyLineHeight: 1.6, headingScale: 1.02 },
    radius: { sm: "4px", md: "8px", lg: "14px", control: "8px" },
    shadows: {
      sm: "0 1px 2px rgb(0 0 0 / 0.08)",
      md: "0 10px 24px -12px rgb(0 0 0 / 0.28)",
      lg: "0 28px 60px -28px rgb(0 0 0 / 0.45)",
    },
    spacing: { section: "clamp(3.5rem, 2rem + 6vw, 8rem)", container: "1400px", gutter: "clamp(1rem, 0.25rem + 3.2vw, 3rem)" },
    motion: { fast: "140ms", base: "240ms", slow: "520ms", ease: "cubic-bezier(0.16, 1, 0.3, 1)" },
  },
  variants: { productCard: "image-first", productImageRatio: "square", animation: "subtle", footer: "surface" },
};
