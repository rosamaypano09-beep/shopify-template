import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/config";

export default function robots(): MetadataRoute.Robots {
  const { seo, store } = getSiteConfig();

  if (!seo.allowIndexing) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/account", "/search", "/wishlist", "/dashboard", "/api/"] },
    sitemap: `${store.url}/sitemap.xml`,
  };
}
