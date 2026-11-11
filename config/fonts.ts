import localFont from "next/font/local";

/**
 * The two typefaces for this client. next/font needs literal file paths, so
 * changing a font means editing the `src` lines below (see THEMING.md for the
 * bundled files and the pairings each preset was designed with).
 *
 * Fonts are self-hosted from /assets/fonts: no request to a font CDN, no
 * layout shift, and builds work offline.
 */
export const headingFont = localFont({
  src: "../assets/fonts/playfair-display-latin-wght-normal.woff2",
  variable: "--ce-font-heading",
  weight: "400 900",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "serif"],
});

export const bodyFont = localFont({
  src: "../assets/fonts/figtree-latin-wght-normal.woff2",
  variable: "--ce-font-body",
  weight: "300 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/**
 * Extra bundled typefaces a section can pick (the brand marquee's Font
 * option). Not preloaded: a browser downloads one only when a section on the
 * page uses it.
 */
// next/font reads these options at build time, so each is written out in full.
export const cormorantFont = localFont({
  src: "../assets/fonts/cormorant-garamond-latin-wght-normal.woff2",
  variable: "--ce-font-cormorant",
  weight: "300 700",
  display: "swap",
  preload: false,
  fallback: ["ui-serif", "Georgia", "serif"],
});

export const bricolageFont = localFont({
  src: "../assets/fonts/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--ce-font-bricolage",
  weight: "200 800",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const jostFont = localFont({
  src: "../assets/fonts/jost-latin-wght-normal.woff2",
  variable: "--ce-font-jost",
  weight: "100 900",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const schibstedFont = localFont({
  src: "../assets/fonts/schibsted-grotesk-latin-wght-normal.woff2",
  variable: "--ce-font-schibsted",
  weight: "400 900",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const playfairFont = localFont({
  src: "../assets/fonts/playfair-display-latin-wght-normal.woff2",
  variable: "--ce-font-playfair",
  weight: "400 900",
  display: "swap",
  preload: false,
  fallback: ["ui-serif", "Georgia", "serif"],
});

export const figtreeFont = localFont({
  src: "../assets/fonts/figtree-latin-wght-normal.woff2",
  variable: "--ce-font-figtree",
  weight: "300 900",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Class names that make every extra font's CSS variable available on the page. */
export const extraFontVariables = [cormorantFont, bricolageFont, jostFont, schibstedFont, playfairFont, figtreeFont].map((font) => font.variable).join(" ");
