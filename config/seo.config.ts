import type { SeoConfig } from "./types";

export const seoConfig: SeoConfig = {
  titleTemplate: "%s | Bantay Daily",
  defaultTitle: "Bantay Daily: daily supplements for dogs",
  defaultDescription:
    "Chews, oils and powders for joints, skin, digestion and calm. Dosed by weight, delivered across the Philippines.",
  defaultSocialImage: "/demo/Hero.png",
  organization: {
    // The business name search engines show for the site.
    name: "PY Pastry Kitchen",
  },
  allowIndexing: process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true,
};
