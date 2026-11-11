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
  /** The bag (cart) and how orders are scheduled. */
  ordering?: OrderingConfig;
}

export interface OrderingConfig {
  /** Title of the cart drawer, for example "Your bag". */
  cartTitle?: string;
  /** A short notice above the checkout button, for example the order cut-off. Only real rules. */
  cartNote?: string;
  /**
   * Ask for a date and time in the bag before checkout. They are saved on the
   * Shopify order (Additional details). Shopify still decides pickup or
   * delivery, shipping cost and payment at checkout.
   */
  scheduling: boolean;
  dateLabel: string;
  timeLabel: string;
  /** Days orders can be collected or delivered: 0 Sunday … 6 Saturday. */
  openDays: number[];
  /** Hour (0–23, store time zone) after which the earliest date moves one day later. */
  cutoffHour: number;
  /** Earliest date, in days from today, when ordering before the cut-off. 1 = tomorrow. */
  minDaysAhead: number;
  /** Latest date that can be chosen, in days from today. */
  maxDaysAhead: number;
  /** Choosable times, for example "10:00 AM – 12:00 PM". */
  timeSlots: string[];
  /** Dates closed despite being open days (holidays), as YYYY-MM-DD. */
  closedDates: string[];
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
    /** Text of the small link under the description, for example "Shop now". */
    ctaLabel?: string;
  };
}

export interface NavigationConfig {
  /**
   * Where the top menu comes from. "shopify" reads the menu named by
   * `shopifyMenuHandle` from Shopify admin (Online Store > Navigation) and
   * falls back to `main` when that menu is empty or Shopify is not connected.
   */
  source?: "config" | "shopify";
  /** Shopify's default header menu is "main-menu". */
  shopifyMenuHandle?: string;
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
    /** Where the desktop menu sits between the logo and the icons. Default "center". */
    navAlign?: "left" | "center" | "right";
    /** How menu links react to hover and show the current page. Default "pill". */
    linkStyle?: "pill" | "underline" | "plain";
    uppercaseLinks?: boolean;
    /** Adds a "View all" link to the bottom of each dropdown. Default true. */
    megaMenuViewAll?: boolean;
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
  /** Adds a footer column listing every page written in Shopify (Online Store > Pages). */
  footerShopifyPages?: { enabled: boolean; title: string };
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

export type SectionBackground =
  /** The page colour. */
  | "default"
  /** A gently tinted band. */
  | "surface"
  /** The brand colour. */
  | "primary"
  /** The theme's secondary colour. */
  | "secondary"
  /** Page and text colours swapped: a dark band on a light theme, a light band on a dark theme. */
  | "inverse"
  /** The page colour with a soft brand-coloured glow. */
  | "glow";

export type SectionBackdrop = "none" | "aurora" | "orbs" | "stars" | "gradient" | "grid";

interface SectionBase {
  /** Unique within the page. Lets the same section type appear twice. */
  id: string;
  enabled: boolean;
  background?: SectionBackground;
  /** `curved`: soft arched top and bottom edges. `card`: an inset rounded panel. */
  shape?: "flat" | "curved" | "card";
  spacing?: "compact" | "normal" | "spacious";
  /**
   * A slowly moving background in the theme's colours. Stands still for
   * visitors who ask for less motion, and when the theme's animation is "none".
   */
  backdrop?: SectionBackdrop;
  /** Heading alignment. */
  align?: "left" | "center";
  /** Small line above the section heading. */
  eyebrow?: string;
  /** Second part of the heading, on its own line in the brand colour. */
  titleAccent?: string;
}

export interface HeroSectionConfig extends SectionBase {
  type: "hero";
  /** `spotlight`: dark band, uppercase serif headline, photo on the right with a soft glow. */
  variant: "split" | "centered" | "spotlight";
  /** Small line above the headline. */
  eyebrow?: string;
  title: string;
  /** Second part of the headline, shown on its own line in the accent colour. */
  titleAccent?: string;
  subtitle?: string;
  primaryCta?: CtaConfig;
  /**
   * Shopify product handle. When set, the main button adds this product to the
   * cart instead of following its link (the link stays as the fallback when the
   * product is sold out or missing).
   */
  addToCartHandle?: string;
  /** Variant title to add, for example "Whole". Leave empty for the first one in stock. */
  addToCartVariant?: string;
  secondaryCta?: CtaConfig;
  /** Small line under the buttons, for example press mentions. Only real ones. */
  proof?: string;
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
  /** Filter tabs above the grid, each showing another collection. The first tab is `collectionHandle`, labelled `allLabel`. */
  tabs?: { label: string; collectionHandle: string }[];
  allLabel?: string;
  /** Cards per row on wide screens. */
  columns?: "2" | "3" | "4";
  /** An "Add to bag" button on each card (products with options get "Choose" instead). */
  quickAdd?: boolean;
  quickAddLabel?: string;
}

export interface BenefitsSectionConfig extends SectionBase {
  type: "benefits";
  title?: string;
  items: { icon: BenefitIcon; title: string; body: string }[];
}

/** An icon name from lib/section-icons.ts (about 70, grouped in the dashboard picker). */
export type BenefitIcon = import("@/lib/section-icons").SectionIconName;

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
  /** `split` puts the heading on the left and the questions on the right. */
  layout?: "stacked" | "split";
  description?: string;
  items: FaqItem[];
  /** Optional link to the full FAQ page. */
  cta?: CtaConfig;
}

export interface TestimonialsSectionConfig extends SectionBase {
  type: "testimonials";
  title: string;
  /** `grid`: cards in rows. `featured`: the first quote large, the rest beside it. `carousel`: one row that swipes. */
  layout?: "grid" | "featured" | "carousel";
  /**
   * Real customers only, quoted with their permission. `avatar` is a photo
   * (initials are shown without one). `rating`, 1 to 5, only if the customer
   * actually gave it.
   */
  items: { quote: string; name: string; detail?: string; avatar?: string; rating?: number }[];
}

export interface LogoMarqueeSectionConfig extends SectionBase {
  type: "logoMarquee";
  /** For example "Trusted by", "As seen in", "Our partners". */
  title?: string;
  /** `card`: the names inside a small centred panel, with an optional line of text under them. */
  layout?: "row" | "card";
  description?: string;
  /** Scroll the row sideways. When false, or when the visitor prefers less motion, the logos sit still. */
  animated: boolean;
  /** Only organisations that really work with or feature the store. `highlight` shows that name in the brand colour, lowercase italic. */
  items: { name: string; logo?: string; href?: string; highlight?: boolean }[];
}

export interface ImageTextSectionConfig extends SectionBase {
  type: "imageText";
  title: string;
  body: string;
  image?: ResponsiveImageConfig;
  imageSide: "left" | "right";
  /** `contain` shows the whole picture (packaging, menus); `cover` fills the frame. */
  imageFit?: "cover" | "contain";
  /** Small cards under the text. */
  cards?: { title: string; body: string }[];
  cta?: CtaConfig;
}

export interface HighlightsSectionConfig extends SectionBase {
  type: "highlights";
  /** Short facts in one line, for example "Baked fresh daily". Only what is true. */
  items: { text: string }[];
  /** `row`: still, in one line. `marquee`: scrolling sideways. `curve`: flowing along a curved line. */
  layout?: "row" | "marquee" | "curve";
  /** The line the text follows in the `curve` layout. */
  curve?: "wave" | "arc" | "dip";
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  size?: "sm" | "md" | "lg";
  font?: MarqueeFont;
  italic?: boolean;
  uppercase?: boolean;
  separator?: "dot" | "sparkle" | "star" | "diamond";
  /** Curve only: a band under the words, in the brand colour or the tinted surface. */
  ribbon?: "none" | "brand" | "surface";
  /** Curve only: lie across the edge of the sections above and below, with no band of its own. */
  overlap?: boolean;
  /** Curve only: run straight on phones (default on). */
  straightOnPhones?: boolean;
}

export interface FeatureStat {
  /** The number as shown, for example "2,000+". With `source: "shopifyOrders"` it is the fallback. */
  value: string;
  /** `shopifyOrders` counts real orders through the Admin API (needs SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET, or SHOPIFY_ADMIN_ACCESS_TOKEN). */
  source?: "manual" | "shopifyOrders";
  /**
   * Real orders taken before the Shopify store (or outside it), added to the
   * Shopify count: 2000 + 37 Shopify orders shows 2,037. Only a real figure.
   */
  baseline?: number;
  /** Always show "+" after the number. */
  plus?: boolean;
  /** Round a Shopify count down, shown with "+": 2,347 becomes 2,300+ with "100". */
  roundDown?: "none" | "10" | "100" | "1000";
  /** Small word under the number, for example "orders". */
  caption?: string;
  /** Small line beside the number, for example "and growing". */
  label: string;
  title?: string;
  titleAccent?: string;
  body?: string;
  /** Count up from zero when the number scrolls into view, slowing as it arrives. */
  countUp?: boolean;
  /** Seconds the count takes. */
  countSeconds?: number;
  /** `speedBlur`: digits blur by how fast they change and sharpen as the count slows. */
  countEffect?: "plain" | "speedBlur";
  /** How readily speed turns into blur. 1 is the default. */
  blurStrength?: number;
  /** Largest blur, in pixels. */
  maxBlur?: number;
  /** Slanted digits. */
  italicNumber?: boolean;
}

export interface FeatureBandSectionConfig extends SectionBase {
  type: "featureBand";
  title: string;
  description?: string;
  /** `centered`: heading above the items. `split`: heading on the left, items on the right. */
  layout?: "centered" | "split";
  /**
   * How each item looks: `chips` (icon and text in a soft box), `outline` and
   * `solid` (rounded pills), `cards` (icon on top, room for a second line),
   * `icons` (large icon above the text), `list` (a plain checklist).
   */
  itemStyle?: "chips" | "outline" | "solid" | "cards" | "icons" | "list";
  /** Items per row on wide screens. `auto` wraps them centred. */
  columns?: "2" | "3" | "4" | "auto";
  iconShape?: "circle" | "square" | "plain";
  /** Short items, each with an icon and an optional second line (shown by the cards and icons styles). */
  items: { icon: BenefitIcon; text: string; body?: string }[];
  /** One real, checkable number. Leave out if there is none. */
  stat?: FeatureStat;
  cta?: CtaConfig;
}

export interface SpotlightProductRef {
  /** Shopify product handle. */
  handle: string;
  /** Shorter name shown on the page, for example "Buko Ube Nipa". Defaults to the Shopify title. */
  label?: string;
}

export interface ProductSpotlightSectionConfig extends SectionBase {
  type: "productSpotlight";
  title: string;
  description?: string;
  /**
   * Products offered as choice buttons (for example one per flavour). The main
   * button adds the chosen one; prices and stock come from Shopify.
   */
  products?: SpotlightProductRef[];
  /** One product whose own options (size, flavour) become the buttons. Used when `products` is empty. */
  productHandle?: string;
  /** Show "From ₱499": the lowest price among the products. */
  showFromPrice?: boolean;
  /** Main button text. `{name}` is replaced by the chosen product. Default "Add {name} to bag". */
  buttonLabel?: string;
  /** Add " · ₱499" to the main button. */
  priceInButton?: boolean;
  /** What fills the other half: a picture, or a menu board of round product tiles that each add to the bag. */
  visual?: "image" | "menu";
  image?: ResponsiveImageConfig;
  imageSide: "left" | "right";
  menu?: {
    title?: string;
    items: SpotlightProductRef[];
    /** A round badge linking to the full menu, for example "Full menu" to /collections. */
    linkLabel?: string;
    linkHref?: string;
  };
  /**
   * A "choose any N" offer. `productHandle` is a Shopify product (for example
   * "Mini Pie Trio") whose price is the bundle price; the chosen flavours are
   * saved on the cart line and reach the order.
   */
  bundle?: { productHandle: string; size: number; lead?: string; linkLabel: string };
  /** A small line with the store's phone and email. */
  showContact?: boolean;
  /** Custom hex colours for the two halves. Empty follows the Look background. */
  visualBackground?: string;
  panelBackground?: string;
  panelText?: string;
}

export interface BlogPostsSectionConfig extends SectionBase {
  type: "blogPosts";
  title: string;
  description?: string;
  /** Shopify blog handle (Online Store > Blog posts > Manage blogs). Shopify's default blog is "news". */
  blogHandle: string;
  limit: number;
  cta?: CtaConfig;
  /** `grid`: cards in rows. `featured`: the newest post large, the next ones beside it. `list`: image left, text right. */
  layout?: "grid" | "featured" | "list";
  columns?: "2" | "3" | "4";
  /** Only posts with this Shopify tag. */
  tag?: string;
  showExcerpt?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  showTags?: boolean;
  /** Link text under each post, for example "Read the story". Empty for none. */
  readMoreLabel?: string;
}

export interface ShopifyPageSectionConfig extends SectionBase {
  type: "shopifyPage";
  /** Handle of a page written in Shopify admin (Online Store > Pages). */
  pageHandle: string;
  /** Show the page's own title as the heading. */
  showTitle: boolean;
  /** Show only the first part and link to the full page. */
  excerptOnly?: boolean;
  image?: ResponsiveImageConfig;
  imageSide?: "left" | "right";
  cta?: CtaConfig;
}

export type MarqueeFont = "heading" | "body" | "playfair" | "cormorant" | "bricolage" | "jost" | "schibsted" | "figtree";

export interface MarqueeSectionConfig extends SectionBase {
  type: "marquee";
  /** Words or short phrases that scroll past, for example "Hand-baked daily". */
  items: { text: string; icon?: BenefitIcon }[];
  /** What sits between items. `icon` uses each item's own icon. */
  separator: "dot" | "star" | "sparkle" | "slash" | "diamond" | "icon" | "none";
  font: MarqueeFont;
  weight: "400" | "500" | "600" | "700" | "800" | "900";
  italic?: boolean;
  uppercase?: boolean;
  /** `outline` draws letters as outlines; `alternate` switches between filled and outlined. */
  textStyle?: "solid" | "outline" | "alternate";
  size: "sm" | "md" | "lg" | "xl" | "display";
  speed: "slow" | "normal" | "fast";
  direction: "left" | "right";
  /** A second row running the other way. */
  doubleRow?: boolean;
  /** A slightly rotated ribbon across the page. */
  tilt?: boolean;
  /** Thin lines above and below. */
  borders?: boolean;
  /** Hex colours. Empty uses the Look background and the theme's colours. Check that text stays readable. */
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export type SectionConfig =
  | MarqueeSectionConfig
  | ShopifyPageSectionConfig
  | HighlightsSectionConfig
  | FeatureBandSectionConfig
  | ProductSpotlightSectionConfig
  | BlogPostsSectionConfig
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
    /**
     * Handle of a page written in Shopify (Online Store > Pages) to show at
     * /about instead of the text below, for example "about-us". The text below
     * is used only if that page is missing.
     */
    shopifyPage?: string;
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
