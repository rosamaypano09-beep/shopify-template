import type { AnalyticsConfig } from "./types";

/**
 * Tracking ids come from environment variables so each deployment (and each
 * client) has its own. Leave a variable empty and that tracker never loads.
 */
export const analyticsConfig: AnalyticsConfig = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || undefined,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined,
  tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || undefined,
  requireConsent: true,
  // Set once the privacy policy exists in Shopify, e.g. "/policies/privacy-policy".
  privacyPolicyHref: undefined,
};
