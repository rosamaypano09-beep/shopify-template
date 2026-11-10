import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { getSiteConfig } from "@/config";
import { bodyFont, headingFont } from "@/config/fonts";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { themeToCssVars } from "@/themes/css-vars";
import "./globals.css";

export function generateMetadata(): Metadata {
  const { seo, store } = getSiteConfig();

  return {
    metadataBase: new URL(store.url),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    applicationName: store.name,
    icons: { icon: store.brand.favicon },
    openGraph: {
      siteName: store.name,
      type: "website",
      locale: store.locale.language.replace("-", "_"),
      ...(seo.defaultSocialImage ? { images: [{ url: seo.defaultSocialImage }] } : {}),
    },
    robots: seo.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export function generateViewport(): Viewport {
  return { themeColor: getSiteConfig().theme.tokens.colors.background };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { store, theme } = getSiteConfig();

  return (
    <html
      lang={store.locale.language}
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
      style={themeToCssVars(theme) as CSSProperties}
      data-theme={theme.id}
      data-animation={theme.variants.animation}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </body>
    </html>
  );
}
