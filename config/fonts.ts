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
  src: "../assets/fonts/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--ce-font-heading",
  weight: "200 800",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const bodyFont = localFont({
  src: "../assets/fonts/figtree-latin-wght-normal.woff2",
  variable: "--ce-font-body",
  weight: "300 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});
