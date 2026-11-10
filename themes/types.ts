export type ProductCardStyle =
  | "minimal"
  | "editorial"
  | "modern"
  | "compact"
  | "image-first"
  | "luxury";

export interface ThemeTokens {
  colors: {
    background: string;
    /** Tinted panels, cards, the footer. */
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    success: string;
    warning: string;
    danger: string;
  };
  typography: {
    headingWeight: number;
    headingTracking: string;
    headingLineHeight: number;
    bodyLineHeight: number;
    /** Multiplies the display and heading sizes. 1 = engine default. */
    headingScale: number;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    /** Buttons and inputs. Use 999px for pills. */
    control: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: {
    /** Vertical padding of homepage sections. */
    section: string;
    /** Max content width. */
    container: string;
    /** Horizontal page padding. */
    gutter: string;
  };
  motion: {
    fast: string;
    base: string;
    slow: string;
    ease: string;
  };
}

export interface ThemeVariants {
  productCard: ProductCardStyle;
  /** Aspect ratio of product imagery in cards and galleries. */
  productImageRatio: "square" | "portrait" | "landscape";
  /** How much the storefront moves. "none" also disables hover transforms. */
  animation: "none" | "subtle" | "lively";
  footer: "surface" | "primary";
}

export interface ThemePreset {
  id: string;
  label: string;
  /** Business types this preset was designed for. Documentation only. */
  suits: string[];
  tokens: ThemeTokens;
  variants: ThemeVariants;
}
