"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLink } from "@/components/ui/site-link";
import type { AnalyticsConfig } from "@/config/types";
import { clearProviders, registerProvider, track } from "@/lib/analytics";
import { setConsent, useConsent } from "@/lib/analytics/consent";
import { loadGa4, loadMetaPixel, loadTikTokPixel } from "@/lib/analytics/loaders";
import { ga4, metaPixel, tiktokPixel } from "@/lib/analytics/providers";

const hasTrackers = (config: AnalyticsConfig) => Boolean(config.ga4Id || config.metaPixelId || config.tiktokPixelId);

/**
 * Loads the configured trackers once the visitor has agreed (or straight
 * away when the store does not require consent), then reports page views.
 * With no IDs configured this renders nothing and loads nothing.
 */
export function Analytics({ config }: { config: AnalyticsConfig }) {
  const consent = useConsent();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const allowed = consent === "granted" || (!config.requireConsent && consent === "undecided");

  useEffect(() => {
    if (!allowed) {
      clearProviders();
      return;
    }
    if (config.ga4Id && loadGa4(config.ga4Id)) registerProvider("ga4", ga4);
    if (config.metaPixelId && loadMetaPixel(config.metaPixelId)) registerProvider("meta", metaPixel);
    if (config.tiktokPixelId && loadTikTokPixel(config.tiktokPixelId)) registerProvider("tiktok", tiktokPixel);
    const timer = window.setTimeout(() => setReady(true), 0);
    return () => window.clearTimeout(timer);
  }, [allowed, config.ga4Id, config.metaPixelId, config.tiktokPixelId]);

  useEffect(() => {
    if (ready && allowed) track({ name: "page_view", path: pathname, title: document.title });
  }, [ready, allowed, pathname]);

  if (!hasTrackers(config) || !config.requireConsent || consent !== "undecided") return null;

  return (
    <section
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-[calc(var(--ce-bottom-nav-height,0px)+0.75rem)] z-40 mx-auto flex max-w-xl flex-col gap-4 rounded-lg border border-border bg-background p-5 shadow-lg sm:flex-row sm:items-center"
    >
      <p className="type-small flex-1">
        We&apos;d like to use cookies to measure visits and improve the shop. The shop works either way.{" "}
        {config.privacyPolicyHref ? (
          <SiteLink href={config.privacyPolicyHref} className="underline underline-offset-4">
            Privacy policy
          </SiteLink>
        ) : null}
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" onClick={() => setConsent("denied")}>
          Decline
        </Button>
        <Button size="sm" onClick={() => setConsent("granted")}>
          Accept
        </Button>
      </div>
    </section>
  );
}
