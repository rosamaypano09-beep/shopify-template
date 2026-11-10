/* Loads each vendor's script once. Called only after consent. IDs are checked so config can never inject script. */

type W = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown; callMethod?: (...a: unknown[]) => void };
  _fbq?: unknown;
  ttq?: unknown[] & Record<string, unknown>;
  TiktokAnalyticsObject?: string;
};

function inject(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function loadGa4(measurementId: string): boolean {
  if (!/^G-[A-Z0-9]{4,20}$/.test(measurementId)) return false;
  const w = window as W;
  w.dataLayer = w.dataLayer ?? [];
  if (!w.gtag) {
    w.gtag = function gtag() {
      // GA reads the raw `arguments` object from the data layer.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer?.push(arguments);
    };
    w.gtag("js", new Date());
    // Page views are sent by the app on every route change, not automatically.
    w.gtag("config", measurementId, { send_page_view: false });
  }
  inject("ce-ga4", `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  return true;
}

export function loadMetaPixel(pixelId: string): boolean {
  if (!/^\d{5,20}$/.test(pixelId)) return false;
  const w = window as W;
  if (!w.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as NonNullable<W["fbq"]> & { queue: unknown[] };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = fbq;
    w.fbq = fbq;
    w._fbq = fbq;
    fbq("init", pixelId);
  }
  inject("ce-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  return true;
}

export function loadTikTokPixel(pixelId: string): boolean {
  if (!/^[A-Z0-9]{10,40}$/i.test(pixelId)) return false;
  const w = window as W;
  if (!w.ttq) {
    w.TiktokAnalyticsObject = "ttq";
    const ttq = [] as unknown as unknown[] & Record<string, unknown>;
    for (const method of ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"]) {
      ttq[method] = (...args: unknown[]) => ttq.push([method, ...args]);
    }
    const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = { [pixelId]: Object.assign([], { _u: url }) };
    ttq._t = { [pixelId]: Date.now() };
    ttq._o = { [pixelId]: {} };
    w.ttq = ttq;
    inject("ce-tiktok-pixel", `${url}?sdkid=${pixelId}&lib=ttq`);
  }
  return true;
}
