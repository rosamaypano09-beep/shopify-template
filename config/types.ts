/**
 * Types for everything a client can configure.
 * The engine (components, lib, themes) reads these; it never hardcodes brand data.
 */

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/* ---------- Brand & store ---------- */

export type LogoConfig =
  /** Shows `text`, or the store name when `text` is left out. */
  | { type: "text"; text?: string }
  | { type: "image"; src: string; alt: string; width: number; height: number };

export type SocialNetwork =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "x";

export interface StoreConfig {
  name: string;
  /** One sentence used in the footer and as a metadata fallback. */
  description: string;
  /** Canonical production URL, no trailing slash. */
  url: string;
  brand: {
    logo: LogoConfig;
    mobileLogo?: LogoConfig;
    footerLogo?: LogoConfig;
    /** Path under /public. */
    favicon: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      region?: string;
      postalCode?: string;
      country: string;
    };
    businessHours?: { days: string; hours: string }[];
  };
  social: Partial<Record<SocialNetwork, string>>;
  locale: {
    /** BCP 47, used for <html lang> and Intl formatting. */
    language: string;
    /** ISO 3166-1 alpha-2, sent to Shopify as the buyer country. */
    country: string;
    /** Fallback only. Prices always carry their own currency from Shopify. */
    currency: string;
    timezone: string;
  };
  /**
   * Promotional messaging only. Shopify stays the source of truth for
   * what shipping actually costs.
   */
  promotions: {
    freeShippingThreshold?: number;
  };
}

/* ---------- Features ---------- */

export interface FeaturesConfig {
  /** Open the cart drawer after "Add to cart". When false, only the cart count updates. */
  cartDrawer: boolean;
  wishlist: boolean;
  reviews: boolean;
  quickView: boolean;
  recentlyViewed: boolean;
  compare: boolean;
  newsletter: boolean;
  testimonials: boolean;
  instagram: boolean;
  predictiveSearch: boolean;
  customerAccounts: boolean;
  stickyAddToCart: boolean;
  mobileBottomNav: boolean;
}

/* ---------- Navigation ---------- */

export interface NavLink {
  label: string;
  href: string;
  /** Opens in a new tab with rel="noopener". */
  external?: boolean;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export interface NavItem extends NavLink {
  /** Present = this item opens a mega menu on desktop and nests on mobile. */
  groups?: NavGroup[];
  /** Optional promo tile shown beside the mega menu columns. */
  feature?: {
    title: string;
    description: string;
    href: string;
    image?: string;
  };
}

export interface NavigationConfig {
  header: {
    sticky: boolean;
    /** Transparent over the hero until the page scrolls. Home page only. */
    transparent: boolean;
    /** Hide on scroll down, show on scroll up. Needs `sticky`. */
    hideOnScroll: boolean;
    showSearch: boolean;
    showAccount: boolean;
    showWishlist: boolean;
    showCart: boolean;
  };
  announcement: {
    enabled: boolean;
    message: string;
    link?: NavLink;
  };
  main: NavItem[];
  /** Falls back to `main` when omitted. */
  mobile?: NavItem[];
  footer: NavGroup[];
  policies: NavLink[];
}

/* ---------- SEO ---------- */

export interface SeoConfig {
  /** `%s` is replaced by the page title. */
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  /** Path under /public or absolute URL. */
  defaultSocialImage?: string;
  organization: {
    name: string;
    logo?: string;
  };
  /** Set false on staging so previews stay out of search results. */
  allowIndexing: boolean;
}

/* ---------- Homepage sections ---------- */

export interface CtaConfig {
  label: string;
  href: string;
}

export interface ResponsiveImageConfig {
  src: string;
  /** Optional art-directed crop for small screens. */
  mobileSrc?: string;
  alt: string;
  position?: "center" | "top" | "bottom" | "left" | "right";
}

interface SectionBase {
  /** Unique within the page. Lets the same section type appear twice. */
  id: string;
  enabled: boolean;
  background?: "default" | "surface" | "primary";
}

export interface HeroSectionConfig extends SectionBase {
  type: "hero";
  variant: "split" | "centered";
  title: string;
  subtitle?: string;
  primaryCta?: CtaConfig;
  secondaryCta?: CtaConfig;
  image?: ResponsiveImageConfig;
}

export interface CollectionGridSectionConfig extends SectionBase {
  type: "collectionGrid";
  title: string;
  description?: string;
  /** Shopify collection handles, in display order. */
  handles: string[];
}

export interface FeaturedProductsSectionConfig extends SectionBase {
  type: "featuredProducts";
  title: string;
  description?: string;
  collectionHandle: string;
  limit: number;
  cta?: CtaConfig;
}

export interface BenefitsSectionConfig extends SectionBase {
  type: "benefits";
  title?: string;
  items: { icon: BenefitIcon; title: string; body: string }[];
}

export type BenefitIcon =
  | "truck"
  | "shield"
  | "leaf"
  | "return"
  | "support"
  | "badge"
  | "heart"
  | "clock";

export interface BrandStatementSectionConfig extends SectionBase {
  type: "brandStatement";
  text: string;
  attribution?: string;
  cta?: CtaConfig;
}

export interface NewsletterSectionConfig extends SectionBase {
  type: "newsletter";
  title: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionConfig extends SectionBase {
  type: "faq";
  title: string;
  items: FaqItem[];
  /** Optional link to the full FAQ page. */
  cta?: CtaConfig;
}

export interface TestimonialsSectionConfig extends SectionBase {
  type: "testimonials";
  title: string;
  /** Real customers only, quoted with their permission. */
  items: { quote: string; name: string; detail?: string }[];
}

export interface LogoMarqueeSectionConfig extends SectionBase {
  type: "logoMarquee";
  /** For example "Trusted by", "As seen in", "Our partners". */
  title?: string;
  /** Scroll the row sideways. When false, or when the visitor prefers less motion, the logos sit still. */
  animated: boolean;
  /** Only organisations that really work with or feature the store. */
  items: { name: string; logo?: string; href?: string }[];
}

export interface ImageTextSectionConfig extends SectionBase {
  type: "imageText";
  title: string;
  body: string;
  image?: ResponsiveImageConfig;
  imageSide: "left" | "right";
  cta?: CtaConfig;
}

export type SectionConfig =
  | TestimonialsSectionConfig
  | LogoMarqueeSectionConfig
  | ImageTextSectionConfig
  | NewsletterSectionConfig
  | FaqSectionConfig
  | HeroSectionConfig
  | CollectionGridSectionConfig
  | FeaturedProductsSectionConfig
  | BenefitsSectionConfig
  | BrandStatementSectionConfig;

export interface HomepageConfig {
  /** Rendered top to bottom. Reorder, duplicate, or disable freely. */
  sections: SectionConfig[];
}

/* ---------- Analytics and privacy ---------- */

export interface AnalyticsConfig {
  /** Google Analytics 4 measurement id, e.g. "G-XXXXXXXXXX". */
  ga4Id?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
  /**
   * Ask before loading any tracker. Keep true unless the client's lawyer
   * confirms consent is not required where they sell.
   */
  requireConsent: boolean;
  /** Linked from the cookie banner. */
  privacyPolicyHref?: string;
}

/* ---------- Content pages ---------- */

export interface PagesConfig {
  about: {
    enabled: boolean;
    title: string;
    intro: string;
    /** Story blocks, shown in order. Images alternate sides. */
    blocks: { title: string; body: string; image?: ResponsiveImageConfig }[];
    /** Short facts. Only real, checkable numbers. */
    stats?: { value: string; label: string }[];
    cta?: CtaConfig;
  };
  faq: {
    enabled: boolean;
    title: string;
    intro?: string;
    groups: { title: string; items: FaqItem[] }[];
  };
  contact: {
    enabled: boolean;
    title: string;
    intro?: string;
    /** "Embed a map" URL from Google Maps (Share > Embed a map > src). Optional. */
    mapEmbedUrl?: string;
    directionsUrl?: string;
  };
}
