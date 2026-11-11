"use client";

import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  FileText,
  GalleryHorizontalEnd,
  HelpCircle,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Mail,
  MessageSquareQuote,
  Newspaper,
  PanelTop,
  Plus,
  Quote,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { SectionConfig } from "@/config/types";
import { saveSettingsAction } from "@/lib/dashboard/actions";
import { saveHomepageDraftAction } from "@/lib/dashboard/draft-actions";
import { cn } from "@/lib/utils";
import { FieldEditor, wide, type Field } from "./fields";
import { HomepagePreview } from "./homepage-preview";

type Obj = Record<string, unknown>;
type SectionType = SectionConfig["type"];

/* ---------- Shared field sets ---------- */

const cta = (key: string, label: string): Field[] => [
  { kind: "text", key: `${key}.label`, label: `${label} text`, max: 60 },
  { kind: "link", key: `${key}.href`, label: `${label} link`, fillLabel: `${key}.label` },
];

const heading = (titleLabel = "Heading"): Field[] => [
  { kind: "text", key: "eyebrow", label: "Small line above", hint: "Shown as a pill. Optional.", max: 80 },
  { kind: "text", key: "title", label: titleLabel, max: 160 },
  { kind: "text", key: "titleAccent", label: "Heading, highlighted line", hint: "Shown under the heading in the brand colour. Optional.", max: 120 },
];


/** The "Look" fields every section except the hero has. */
const look = ({ align = true }: { align?: boolean } = {}): Field[] => [
  { kind: "divider", key: "_look", label: "Look" },
  {
    kind: "select",
    key: "background",
    label: "Background",
    options: [
      { value: "default", label: "Page colour" },
      { value: "surface", label: "Tinted" },
      { value: "glow", label: "Page colour with a brand glow" },
      { value: "secondary", label: "Secondary colour" },
      { value: "primary", label: "Brand colour" },
      { value: "inverse", label: "Inverted (light on dark, or dark on light)" },
    ],
  },
  {
    kind: "select",
    key: "shape",
    label: "Shape",
    options: [
      { value: "flat", label: "Full width" },
      { value: "curved", label: "Curved top and bottom" },
      { value: "card", label: "Rounded card" },
    ],
  },
  {
    kind: "select",
    key: "backdrop",
    label: "Animated background",
    hint: "Moves slowly in your theme colours. Stands still for visitors who prefer less motion.",
    options: [
      { value: "none", label: "None" },
      { value: "aurora", label: "Aurora: drifting colour light" },
      { value: "orbs", label: "Floating orbs" },
      { value: "stars", label: "Twinkling stars" },
      { value: "gradient", label: "Shifting gradient" },
      { value: "grid", label: "Drifting grid" },
    ],
  },
  {
    kind: "select",
    key: "spacing",
    label: "Space above and below",
    options: [
      { value: "normal", label: "Normal" },
      { value: "compact", label: "Compact" },
      { value: "spacious", label: "Spacious" },
    ],
  },
  ...(align
    ? [
        {
          kind: "select" as const,
          key: "align",
          label: "Heading alignment",
          options: [
            { value: "left", label: "Left" },
            { value: "center", label: "Centred" },
          ],
        },
      ]
    : []),
];

const content: Field = { kind: "divider", key: "_content", label: "Content" };

/* ---------- Section catalogue ---------- */

interface SectionType_ {
  label: string;
  description: string;
  /** Shown at the top of the open section: what it does and how to fill it in. */
  help: string[];
  icon: LucideIcon;
  blank: Obj;
  fields: Field[];
}

const TYPES: Record<SectionType, SectionType_> = {
  hero: {
    label: "Hero",
    description: "The first screen: big headline, photo and main button.",
    help: ["The first thing visitors see. Keep the headline short: the highlighted part goes on its own line in the brand colour.", "Spotlight layout: dark band, uppercase serif headline and the photo on the right with a soft glow. A top-down product photo on a dark background looks best.", "Main button: give it a link. To make it add a pie to the bag instead, pick a product under Main button adds this product. If that product is sold out, the button goes back to the link.", "Proof line: small text under the button. Only real press mentions or facts."],
    icon: PanelTop,
    blank: { variant: "spotlight", title: "Your headline", subtitle: "" },
    fields: [
      {
        kind: "select",
        key: "variant",
        label: "Layout",
        options: [
          { value: "spotlight", label: "Spotlight: dark band, uppercase serif, glowing photo" },
          { value: "split", label: "Text beside image" },
          { value: "centered", label: "Text above image" },
        ],
      },
      { kind: "text", key: "eyebrow", label: "Small line above the headline", hint: "For example: A Manila heirloom, hand-baked daily", max: 80 },
      { kind: "text", key: "title", label: "Headline", max: 160 },
      { kind: "text", key: "titleAccent", label: "Headline, highlighted part", hint: "Shown on its own line in the brand colour", max: 120 },
      { kind: "textarea", key: "subtitle", label: "Supporting text", hint: "One or two sentences.", max: 400 },
      { kind: "divider", key: "_photo", label: "Photo" },
      { kind: "image", key: "image.src", label: "Photo", hint: "Spotlight looks best with a top-down product shot on a dark background." },
      { kind: "text", key: "image.alt", label: "Photo description", hint: "Read aloud by screen readers" },
      {
        kind: "select",
        key: "image.position",
        label: "Photo focus",
        options: ["center", "top", "bottom", "left", "right"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
      },
      { kind: "divider", key: "_buttons", label: "Buttons" },
      ...cta("primaryCta", "Main button"),
      { kind: "handle", key: "addToCartHandle", label: "Main button adds this product", source: "Products", hint: "Leave empty for a plain link. Falls back to the link when sold out." },
      { kind: "text", key: "addToCartVariant", label: "Which variant", hint: "For example Whole. Leave empty for the first one in stock.", max: 120 },
      ...cta("secondaryCta", "Second link"),
      { kind: "text", key: "proof", label: "Proof line", hint: "Small text under the button, for example real press mentions.", max: 200 },
    ],
  },
  highlights: {
    label: "Trust strip",
    description: "Short facts under the hero: still, scrolling sideways, or flowing along a curve.",
    help: [
      "A strip of short facts, usually right under the hero. Keep each to two to five words, for example Baked fresh daily. Only what is true.",
      "Layout: Still shows them in one line. Scrolling marquee runs them sideways in a loop. Flowing curve moves them along a wave, arch or smile line.",
      "Flowing curve extras: a ribbon under the words (brand colour or tinted), and Lie across the sections, which lets the ribbon float over the edge between the hero and the next section, like a banner.",
      "Font, size, italic and uppercase change how the words look; the separator mark sits between them in the brand colour.",
      "Everything stands still for visitors who prefer less motion.",
    ],
    icon: GalleryHorizontalEnd,
    blank: { items: [{ text: "Baked fresh daily" }, { text: "Pickup or delivery" }], layout: "marquee", background: "surface", straightOnPhones: true },
    fields: [
      content,
      { kind: "items", key: "items", label: "Fact", addLabel: "Add fact", max: 8, hint: "Only what is true.", blank: { text: "" }, fields: [{ kind: "text", key: "text", label: "Text", max: 60 }] },
      { kind: "divider", key: "_style", label: "Style" },
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        options: [
          { value: "row", label: "Still, in one line" },
          { value: "marquee", label: "Scrolling marquee" },
          { value: "curve", label: "Flowing along a curve" },
        ],
      },
      {
        kind: "select",
        key: "curve",
        label: "Curve shape",
        hint: "Flowing curve only.",
        options: [
          { value: "wave", label: "Wave" },
          { value: "arc", label: "Arch" },
          { value: "dip", label: "Smile" },
        ],
      },
      {
        kind: "select",
        key: "font",
        label: "Font",
        options: [
          { value: "heading", label: "Theme heading font" },
          { value: "body", label: "Theme body font" },
          { value: "playfair", label: "Playfair Display (bold serif)" },
          { value: "cormorant", label: "Cormorant Garamond (elegant serif)" },
          { value: "bricolage", label: "Bricolage Grotesque" },
          { value: "jost", label: "Jost" },
          { value: "schibsted", label: "Schibsted Grotesk" },
          { value: "figtree", label: "Figtree" },
        ],
      },
      {
        kind: "select",
        key: "size",
        label: "Size",
        hint: "Marquee and curve.",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
      {
        kind: "select",
        key: "separator",
        label: "Separator",
        options: [
          { value: "sparkle", label: "Sparkle ✦" },
          { value: "dot", label: "Dot •" },
          { value: "star", label: "Star ★" },
          { value: "diamond", label: "Diamond ◆" },
        ],
      },
      {
        kind: "select",
        key: "speed",
        label: "Speed",
        options: [
          { value: "slow", label: "Slow" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
        ],
      },
      {
        kind: "select",
        key: "direction",
        label: "Direction",
        options: [
          { value: "left", label: "Right to left" },
          { value: "right", label: "Left to right" },
        ],
      },
      { kind: "toggle", key: "uppercase", label: "Uppercase" },
      { kind: "toggle", key: "italic", label: "Italic" },
      {
        kind: "select",
        key: "ribbon",
        label: "Ribbon under the words",
        hint: "Flowing curve only.",
        options: [
          { value: "brand", label: "Brand colour ribbon" },
          { value: "surface", label: "Tinted ribbon" },
          { value: "none", label: "No ribbon, a fine line" },
        ],
      },
      { kind: "toggle", key: "straightOnPhones", label: "Run straight on phones", hint: "Flowing curve only. A wave is steep on a narrow screen." },
      { kind: "toggle", key: "overlap", label: "Lie across the sections above and below", hint: "Flowing curve only. The ribbon floats over the edge between the two sections; best with a ribbon." },
      ...look(),
    ],
  },
  imageText: {
    label: "Story: image with text",
    description: "A photo beside a heading, paragraph, small cards and a button.",
    help: ["A photo beside a story: pill line, heading with a highlighted second line, text, optional small cards and a button.", "Image fit: Show the whole picture for menus, packaging or cut-outs; Fill the frame for photos.", "Small cards are optional: up to four short points under the text. Leave them out for a simpler look."],
    icon: ImageIcon,
    blank: { title: "A heading", body: "A short paragraph.", imageSide: "left" },
    fields: [
      content,
      ...heading(),
      { kind: "textarea", key: "body", label: "Text", max: 1200 },
      {
        kind: "items",
        key: "cards",
        label: "Small card",
        addLabel: "Add small card",
        max: 4,
        hint: "Optional. Short points shown as cards under the text.",
        blank: { title: "", body: "" },
        fields: [
          { kind: "text", key: "title", label: "Title", max: 80 },
          { kind: "textarea", key: "body", label: "Text", max: 240 },
        ],
      },
      ...cta("cta", "Button"),
      { kind: "divider", key: "_image", label: "Image" },
      { kind: "image", key: "image.src", label: "Image" },
      { kind: "text", key: "image.alt", label: "Image description" },
      { kind: "select", key: "imageSide", label: "Image position", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      {
        kind: "select",
        key: "imageFit",
        label: "Image fit",
        options: [
          { value: "cover", label: "Fill the frame" },
          { value: "contain", label: "Show the whole picture" },
        ],
      },
      ...look({ align: false }),
    ],
  },
  featureBand: {
    label: "Feature band",
    description: "A bold statement with icon items in six styles and a big number that counts up.",
    help: [
      "A statement band like Created for people who crave something unforgettable, with short items and an optional big proof number.",
      "Item style: Chips (soft boxes), Outline or Solid pills, Cards (room for a second line), Big icons, or a plain List. Choose any icon from the picker; search it by name.",
      "Layout: Centred puts the heading above the items; Split puts it on the left and the items on the right.",
      "Earlier orders to add: a real number of orders from before the Shopify store (for example 2000). Each new Shopify order then adds to it. For a number that never goes down, the app needs the read_all_orders scope; the status line at the top of this page tells you.",
      "Big number: type it (for example 2,000+), or choose Count orders from Shopify. That needs a Dev Dashboard app with the read_orders scope (SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET); without it, the typed number is shown. Only real, checkable figures.",
      "Count up: the number runs up from zero when it scrolls into view and slows down as it reaches the real figure. Count time sets how long that takes. Speed blur smears the digits while they race and sharpens them as they land; Blur strength and Most blur tune it.",
      "Looks best with the Glow background, the Curved shape and an Aurora or Stars animated background.",
    ],
    icon: Sparkles,
    blank: { title: "Created for people who crave", titleAccent: "something unforgettable.", items: [{ icon: "gift", text: "" }], background: "glow", shape: "curved", align: "center", itemStyle: "chips", columns: "2" },
    fields: [
      content,
      ...heading(),
      { kind: "textarea", key: "description", label: "Text", max: 400 },
      {
        kind: "items",
        key: "items",
        label: "Item",
        addLabel: "Add item",
        max: 12,
        blank: { icon: "check", text: "" },
        fields: [
          { kind: "text", key: "text", label: "Text", max: 60 },
          { kind: "icon", key: "icon", label: "Icon" },
          { kind: "textarea", key: "body", label: "Second line", hint: "Optional. A short line under the text, in every style.", max: 200 },
        ],
      },
      { kind: "divider", key: "_items", label: "Item style" },
      {
        kind: "select",
        key: "itemStyle",
        label: "Style",
        options: [
          { value: "chips", label: "Chips: icon and text in a soft box" },
          { value: "outline", label: "Outline pills" },
          { value: "solid", label: "Solid pills in the brand colour" },
          { value: "cards", label: "Cards with a second line" },
          { value: "icons", label: "Big icons above the text" },
          { value: "list", label: "Plain checklist" },
        ],
      },
      {
        kind: "select",
        key: "columns",
        label: "Items per row",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "auto", label: "As many as fit, centred" },
        ],
      },
      {
        kind: "select",
        key: "iconShape",
        label: "Icon background",
        options: [
          { value: "circle", label: "Circle" },
          { value: "square", label: "Rounded square" },
          { value: "plain", label: "None" },
        ],
      },
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        options: [
          { value: "centered", label: "Heading above the items" },
          { value: "split", label: "Heading beside the items" },
        ],
      },
      { kind: "divider", key: "_stat", label: "Big number", hint: "Leave the number empty for none." },
      {
        kind: "select",
        key: "stat.source",
        label: "Number comes from",
        options: [
          { value: "manual", label: "What I type below" },
          { value: "shopifyOrders", label: "Count orders from Shopify" },
        ],
      },
      { kind: "text", key: "stat.value", label: "Number", hint: "For example 2,000+. With Count orders from Shopify, shown while Shopify cannot be read or has no orders yet.", max: 20 },
      {
        kind: "select",
        key: "stat.roundDown",
        label: "Round the Shopify count down to",
        hint: "Shown with a +. 2,347 orders become 2,300+ with hundreds.",
        options: [
          { value: "100", label: "Hundreds" },
          { value: "1000", label: "Thousands" },
          { value: "10", label: "Tens" },
          { value: "none", label: "Exact number" },
        ],
      },
      { kind: "number", key: "stat.baseline", label: "Earlier orders to add", hint: "Real orders from before the Shopify store, added to the Shopify count. For example 2000." },
      { kind: "toggle", key: "stat.plus", label: "Always show + after the number" },
      { kind: "text", key: "stat.caption", label: "Word under the number", hint: "For example: orders", max: 30 },
      { kind: "toggle", key: "stat.countUp", label: "Count up when it comes into view" },
      { kind: "number", key: "stat.countSeconds", label: "Count time, in seconds", hint: "0.5 to 15. Default 2.5. Longer feels calmer." },
      {
        kind: "select",
        key: "stat.countEffect",
        label: "Count effect",
        options: [
          { value: "speedBlur", label: "Speed blur: digits blur while fast, sharpen as they land" },
          { value: "plain", label: "Plain count" },
        ],
      },
      { kind: "number", key: "stat.blurStrength", label: "Blur strength", hint: "0 to 3. Default 1. Higher blurs for longer." },
      { kind: "number", key: "stat.maxBlur", label: "Most blur, in pixels", hint: "0 to 30. Default 12." },
      { kind: "toggle", key: "stat.italicNumber", label: "Slanted digits" },
      { kind: "text", key: "stat.label", label: "Small line beside it", hint: "For example: and growing", max: 60 },
      { kind: "text", key: "stat.title", label: "Heading beside it", hint: "For example: Making celebrations", max: 80 },
      { kind: "text", key: "stat.titleAccent", label: "Highlighted line", hint: "For example: sweeter.", max: 80 },
      { kind: "textarea", key: "stat.body", label: "Text beside it", max: 200 },
      ...cta("cta", "Button"),
      ...look(),
    ],
  },
  marquee: {
    label: "Brand marquee",
    description: "Big brand words scrolling across the page, in your own colours and font.",
    help: [
      "Words or short phrases that scroll across the page, like a ribbon: Hand-baked daily ✦ Ube ✦ Buko ✦ …",
      "Font and colours are yours: pick one of six fonts, weight, italic, uppercase, outlined letters, and any background, text and separator colour. Leave a colour empty to follow the theme.",
      "Check the readability box under the colours: aim for 4.5:1 or more. Very large words are fine from 3:1.",
      "Separator: a dot, star, sparkle, diamond, slash, each word's own icon, or nothing.",
      "Second row runs the other way; Tilted makes a slanted ribbon. It pauses when hovered and stands still for visitors who prefer less motion.",
    ],
    icon: GalleryHorizontalEnd,
    blank: {
      items: [{ text: "Hand-baked daily" }, { text: "Buko" }, { text: "Ube" }, { text: "Calamansi" }],
      separator: "sparkle",
      font: "heading",
      weight: "800",
      uppercase: true,
      size: "lg",
      speed: "normal",
      direction: "left",
      borders: true,
    },
    fields: [
      content,
      {
        kind: "items",
        key: "items",
        label: "Word",
        addLabel: "Add word",
        max: 16,
        blank: { text: "" },
        fields: [
          { kind: "text", key: "text", label: "Text", max: 60 },
          { kind: "icon", key: "icon", label: "Icon", hint: "Used when Separator is Each word's icon." },
        ],
      },
      { kind: "divider", key: "_type", label: "Font" },
      {
        kind: "select",
        key: "font",
        label: "Font",
        options: [
          { value: "heading", label: "Theme heading font" },
          { value: "body", label: "Theme body font" },
          { value: "playfair", label: "Playfair Display (bold serif)" },
          { value: "cormorant", label: "Cormorant Garamond (elegant serif)" },
          { value: "bricolage", label: "Bricolage Grotesque (playful sans)" },
          { value: "jost", label: "Jost (geometric sans)" },
          { value: "schibsted", label: "Schibsted Grotesk (clean sans)" },
          { value: "figtree", label: "Figtree (friendly sans)" },
        ],
      },
      {
        kind: "select",
        key: "weight",
        label: "Weight",
        options: [
          { value: "400", label: "Regular" },
          { value: "500", label: "Medium" },
          { value: "600", label: "Semibold" },
          { value: "700", label: "Bold" },
          { value: "800", label: "Extra bold" },
          { value: "900", label: "Black" },
        ],
      },
      {
        kind: "select",
        key: "size",
        label: "Size",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
          { value: "xl", label: "Extra large" },
          { value: "display", label: "Huge" },
        ],
      },
      {
        kind: "select",
        key: "textStyle",
        label: "Letters",
        options: [
          { value: "solid", label: "Filled" },
          { value: "outline", label: "Outlined" },
          { value: "alternate", label: "Alternate filled and outlined" },
        ],
      },
      { kind: "toggle", key: "uppercase", label: "Uppercase" },
      { kind: "toggle", key: "italic", label: "Italic" },
      { kind: "divider", key: "_colours", label: "Colours" },
      { kind: "color", key: "backgroundColor", label: "Background", optional: true },
      { kind: "color", key: "textColor", label: "Text", optional: true },
      { kind: "color", key: "accentColor", label: "Separators", optional: true },
      { kind: "contrast", key: "_contrast", label: "Readability", fg: "textColor", bg: "backgroundColor" },
      { kind: "divider", key: "_motion", label: "Movement" },
      {
        kind: "select",
        key: "separator",
        label: "Separator",
        options: [
          { value: "sparkle", label: "Sparkle ✦" },
          { value: "star", label: "Star ★" },
          { value: "dot", label: "Dot •" },
          { value: "diamond", label: "Diamond ◆" },
          { value: "slash", label: "Slash /" },
          { value: "icon", label: "Each word's icon" },
          { value: "none", label: "None" },
        ],
      },
      {
        kind: "select",
        key: "speed",
        label: "Speed",
        options: [
          { value: "slow", label: "Slow" },
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
        ],
      },
      {
        kind: "select",
        key: "direction",
        label: "Direction",
        options: [
          { value: "left", label: "Right to left" },
          { value: "right", label: "Left to right" },
        ],
      },
      { kind: "toggle", key: "doubleRow", label: "Second row, the other way" },
      { kind: "toggle", key: "tilt", label: "Tilted ribbon" },
      { kind: "toggle", key: "borders", label: "Thin lines above and below" },
      ...look({ align: false }),
    ],
  },
  productSpotlight: {
    label: "Pick your favourite",
    description: "Your chosen Shopify products as flavour buttons, a menu board that adds in one tap, and a choose-any-3 bundle.",
    help: [
      "Choices: pick the Shopify products to offer (for example your four mini pies) and give each a short name such as Buko Ube Nipa. The chosen one fills in the brand colour, and the main button names it and shows its price. Prices and stock always come from Shopify.",
      "From price: shows the lowest price among the choices, for example From ₱499.",
      "Main button text: {name} is replaced by the chosen product, so Add {name} to bag becomes Add Buko Ube Nipa to bag · ₱499.",
      "Other half: a photo, or a menu board. On the menu board each round tile is a Shopify product: tapping it adds it to the bag (products with options open their page instead). Tiles use the product photo from Shopify, or its initials when there is none.",
      "Bundle (choose any N): create a product in Shopify, for example Mini Pie Trio at ₱1,399, and pick it here. Visitors choose any 3 from your choices; the bundle product is added at its Shopify price, and the chosen flavours are saved on the order (Flavours: Buko Ube Nipa ×2, …).",
      "Colours: set the two halves (for example lilac and cream) and the text colour. Check the readability box; aim for 4.5:1.",
    ],
    icon: ShoppingBag,
    blank: {
      title: "Pick your favorite.",
      eyebrow: "Mini pie collection",
      products: [{ handle: "", label: "" }],
      imageSide: "left",
      visual: "menu",
      menu: { items: [] },
      showFromPrice: true,
      priceInButton: true,
      buttonLabel: "Add {name} to bag",
    },
    fields: [
      content,
      { kind: "text", key: "eyebrow", label: "Small line above", hint: "For example: Mini pie collection", max: 80 },
      { kind: "text", key: "title", label: "Heading", max: 160 },
      { kind: "text", key: "titleAccent", label: "Heading, highlighted line", hint: "Optional.", max: 120 },
      { kind: "textarea", key: "description", label: "Text", max: 400 },
      { kind: "divider", key: "_choices", label: "Choices (from Shopify)", hint: "The products visitors pick between. Each becomes a button." },
      {
        kind: "items",
        key: "products",
        label: "Choice",
        addLabel: "Add a product",
        max: 12,
        collapsible: true,
        summaryKey: "label",
        blank: { handle: "", label: "" },
        fields: [
          { kind: "handle", key: "handle", label: "Shopify product", source: "Products" },
          { kind: "text", key: "label", label: "Short name on the button", hint: "Optional. Defaults to the Shopify title.", max: 60 },
        ],
      },
      { kind: "toggle", key: "showFromPrice", label: "Show From price (the lowest)" },
      { kind: "text", key: "buttonLabel", label: "Main button text", hint: "{name} becomes the chosen product. Default: Add {name} to bag", max: 60 },
      { kind: "toggle", key: "priceInButton", label: "Show the price in the button" },
      { kind: "handle", key: "productHandle", label: "Or: one product with options", source: "Products", hint: "Only used when no choices are added: its own options (size, flavour) become the buttons." },
      { kind: "divider", key: "_bundle", label: "Bundle: choose any N", hint: "Optional. Needs a bundle product in Shopify, for example Mini Pie Trio." },
      { kind: "handle", key: "bundle.productHandle", label: "Bundle product", source: "Products", hint: "Its Shopify price is the bundle price." },
      { kind: "number", key: "bundle.size", label: "How many to choose", hint: "2 to 12. For a trio, 3." },
      { kind: "text", key: "bundle.lead", label: "Text before the link", hint: "For example: Can't choose?", max: 60 },
      { kind: "text", key: "bundle.linkLabel", label: "Link text", hint: "For example: Get a Trio of any 3. The price is added after it.", max: 80 },
      { kind: "divider", key: "_visual", label: "Other half" },
      {
        kind: "select",
        key: "visual",
        label: "Show",
        options: [
          { value: "menu", label: "Menu board: round tiles that add to the bag" },
          { value: "image", label: "A photo" },
        ],
      },
      { kind: "select", key: "imageSide", label: "Position", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      { kind: "text", key: "menu.title", label: "Menu board title", hint: "For example: PY Pastry Kitchen", max: 60 },
      {
        kind: "items",
        key: "menu.items",
        label: "Tile",
        addLabel: "Add a tile",
        max: 24,
        collapsible: true,
        summaryKey: "label",
        hint: "Any Shopify products: mini pies, cookies, bundles.",
        blank: { handle: "", label: "" },
        fields: [
          { kind: "handle", key: "handle", label: "Shopify product", source: "Products" },
          { kind: "text", key: "label", label: "Short name", hint: "Optional.", max: 40 },
        ],
      },
      { kind: "text", key: "menu.linkLabel", label: "Round badge text", hint: "For example: Full menu. Empty for none.", max: 20 },
      { kind: "link", key: "menu.linkHref", label: "Round badge link" },
      { kind: "image", key: "image.src", label: "Photo", hint: "When Show is A photo. Empty uses the first product's photo." },
      { kind: "text", key: "image.alt", label: "Photo description" },
      { kind: "toggle", key: "showContact", label: "Show phone and email under the button", hint: "From Store details." },
      { kind: "divider", key: "_colours", label: "Colours" },
      { kind: "color", key: "visualBackground", label: "Board / photo side", optional: true },
      { kind: "color", key: "panelBackground", label: "Text side", optional: true },
      { kind: "color", key: "panelText", label: "Text colour", optional: true },
      { kind: "contrast", key: "_contrast", label: "Readability", fg: "panelText", bg: "panelBackground" },
      ...look({ align: false }),
    ],
  },
  featuredProducts: {
    label: "Product grid",
    description: "Products from a collection, with filter tabs and Add to bag buttons.",
    help: ["A grid of products from one collection, in the order set in Shopify (Collections > Sort).", "Filter tabs: each tab shows another collection, for example Whole, Mini, Petit. The first tab is the main collection, named by First tab name. Tabs whose collection is empty are hidden.", "Add to bag button: products with one variant go straight into the bag; products with options show Choose and open their page.", "The whole section hides if none of its collections has products."],
    icon: LayoutGrid,
    blank: { title: "Fresh from the oven", collectionHandle: "best-sellers", limit: 8, columns: "4", quickAdd: true },
    fields: [
      content,
      ...heading(),
      { kind: "textarea", key: "description", label: "Text", max: 400 },
      { kind: "handle", key: "collectionHandle", label: "Collection", source: "Collections" },
      { kind: "number", key: "limit", label: "Products per tab", hint: "1 to 24" },
      { kind: "text", key: "allLabel", label: "First tab name", hint: "Default: All. Only shown when there are tabs.", max: 40 },
      {
        kind: "items",
        key: "tabs",
        label: "Filter tab",
        addLabel: "Add filter tab",
        max: 8,
        hint: "Each tab shows another collection. Tabs with an empty collection are hidden.",
        blank: { label: "", collectionHandle: "" },
        fields: [
          { kind: "text", key: "label", label: "Tab name", max: 40 },
          { kind: "handle", key: "collectionHandle", label: "Collection", source: "Collections" },
        ],
      },
      ...cta("cta", "Link"),
      { kind: "divider", key: "_cards", label: "Product cards" },
      {
        kind: "select",
        key: "columns",
        label: "Cards per row",
        options: [
          { value: "4", label: "4" },
          { value: "3", label: "3" },
          { value: "2", label: "2" },
        ],
      },
      { kind: "toggle", key: "quickAdd", label: "Add to bag button on each card", hint: "Products with options show Choose instead." },
      { kind: "text", key: "quickAddLabel", label: "Button text", hint: "Default: Add to bag", max: 30 },
      ...look(),
    ],
  },
  collectionGrid: {
    label: "Collection tiles",
    description: "Tiles linking to your Shopify collections.",
    help: ["Tiles that link to your Shopify collections, using each collection's own image and title from Shopify.", "Pick collections in the order you want them shown. Use the arrows on a chip to reorder, the cross to remove.", "A collection that does not exist or is not published is skipped. Change a tile's image in Shopify admin (Collections > the collection > Image)."],
    icon: LayoutGrid,
    blank: { title: "Shop by category", handles: [] },
    fields: [
      content,
      ...heading("Title"),
      { kind: "textarea", key: "description", label: "Description", max: 400 },
      { kind: "handles", key: "handles", label: "Collections", source: "Collections", hint: "Shown in this order. Pick from your Shopify collections, or type a handle and press Add." },
      ...look(),
    ],
  },
  benefits: {
    label: "Benefits row",
    description: "Short promises with icons.",
    help: ["A row of short promises with icons, such as delivery or freshness.", "Only list what the store really offers. Two to four benefits read best."],
    icon: BadgeCheck,
    blank: { items: [{ icon: "truck", title: "Benefit", body: "" }] },
    fields: [
      content,
      { kind: "text", key: "title", label: "Title", max: 120 },
      {
        kind: "items",
        key: "items",
        label: "Benefit",
        addLabel: "Add benefit",
        hint: "Only list what the store really offers.",
        blank: { icon: "badge", title: "", body: "" },
        fields: [
          { kind: "text", key: "title", label: "Title", max: 80 },
          { kind: "icon", key: "icon", label: "Icon" },
          { kind: "textarea", key: "body", label: "Text", max: 240 },
        ],
      },
      ...look({ align: false }),
    ],
  },
  logoMarquee: {
    label: "Press / logo row",
    description: "As seen in, partners or press, as a row or a small card.",
    help: ["Press, partners or awards. Row layout runs across the page; Small centred card shows the names in a panel with a line of text underneath.", "Add a logo image, or leave it empty to show the name as text.", "Only organisations that really featured or work with the store."],
    icon: Star,
    blank: { title: "As featured in", layout: "card", animated: false, items: [{ name: "", logo: "", href: "" }] },
    fields: [
      content,
      { kind: "text", key: "title", label: "Small heading", hint: "For example: As featured in, Trusted by", max: 80 },
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        options: [
          { value: "row", label: "Row across the page" },
          { value: "card", label: "Small centred card" },
        ],
      },
      { kind: "textarea", key: "description", label: "Text under the names", hint: "Card layout only. Optional.", max: 300 },
      { kind: "toggle", key: "animated", label: "Scroll sideways", hint: "Row layout, four or more logos. Stands still for visitors who prefer less motion." },
      {
        kind: "items",
        key: "items",
        label: "Name",
        addLabel: "Add name",
        hint: "Only organisations that really work with or feature the store.",
        blank: { name: "", logo: "", href: "" },
        fields: [
          { kind: "text", key: "name", label: "Name", max: 60 },
          { kind: "link", key: "href", label: "Link (optional)" },
          { kind: "toggle", key: "highlight", label: "Highlight this name", hint: "Brand colour, lowercase italic. Names without a logo only." },
          { kind: "image", key: "logo", label: "Logo", hint: "Optional. Without a logo the name is shown as text." },
        ],
      },
      ...look({ align: false }),
    ],
  },
  testimonials: {
    label: "Testimonials",
    description: "Customer quotes as cards with avatars, a featured layout or a swipeable row.",
    help: [
      "Real customers only, quoted with their permission. Never write quotes yourself.",
      "Avatar: upload the customer's photo, or leave it empty to show their initials (first name and surname, for example MS for Maria Santos) on a brand-colour circle.",
      "Rating: only if the customer actually gave one, 1 to 5 stars. Leave it empty otherwise.",
      "Layout: Grid shows cards in rows; Featured makes the first quote large; Carousel is one row visitors can swipe.",
      "No need to type quotation marks: each card draws its own.",
    ],
    icon: MessageSquareQuote,
    blank: { title: "What customers say", layout: "grid", items: [{ quote: "", name: "", detail: "" }] },
    fields: [
      content,
      ...heading("Title"),
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        options: [
          { value: "grid", label: "Grid of cards" },
          { value: "featured", label: "First quote featured large" },
          { value: "carousel", label: "Swipeable row" },
        ],
      },
      {
        kind: "items",
        key: "items",
        label: "Testimonial",
        addLabel: "Add testimonial",
        collapsible: true,
        summaryKey: "name",
        max: 12,
        hint: "Real customers only, quoted with their permission. Rows without a quote and a name are not shown.",
        blank: { quote: "", name: "", detail: "" },
        fields: [
          { kind: "text", key: "name", label: "Customer name", hint: "First name and surname give two initials.", max: 80 },
          { kind: "text", key: "detail", label: "Detail", hint: "For example a city, or what they ordered", max: 80 },
          { kind: "textarea", key: "quote", label: "What they said", max: 600 },
          { kind: "image", key: "avatar", label: "Avatar photo", hint: "Optional. Without one, their initials are shown." },
          {
            kind: "select",
            key: "rating",
            label: "Rating",
            hint: "Only the customer's own rating.",
            options: [
              { value: "", label: "No rating" },
              { value: "5", label: "★★★★★ 5" },
              { value: "4", label: "★★★★ 4" },
              { value: "3", label: "★★★ 3" },
              { value: "2", label: "★★ 2" },
              { value: "1", label: "★ 1" },
            ],
          },
        ],
      },
      ...look(),
    ],
  },
  faq: {
    label: "Questions and answers",
    description: "An accordion of questions, stacked or beside a big heading.",
    help: ["Questions and answers that open one by one. Search engines can show them directly in results.", "Split layout puts the big heading on the left and the questions on the right. Stacked puts the heading on top.", "Write answers that match what Shopify does at checkout (delivery, payment), so they never contradict it."],
    icon: HelpCircle,
    blank: { title: "Pie questions,", titleAccent: "answered.", layout: "split", items: [{ question: "", answer: "" }] },
    fields: [
      content,
      ...heading("Title"),
      { kind: "textarea", key: "description", label: "Text", max: 400 },
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        options: [
          { value: "stacked", label: "Heading above questions" },
          { value: "split", label: "Heading beside questions" },
        ],
      },
      {
        kind: "items",
        key: "items",
        label: "Question",
        addLabel: "Add question",
        blank: { question: "", answer: "" },
        fields: [
          { kind: "text", key: "question", label: "Question", max: 200 },
          { kind: "textarea", key: "answer", label: "Answer", max: 1500 },
        ],
      },
      ...cta("cta", "Link"),
      ...look(),
    ],
  },
  blogPosts: {
    label: "Blog posts (from Shopify)",
    description: "The newest posts from a Shopify blog, as a grid, featured layout or list.",
    help: [
      "Shows the newest posts from a Shopify blog (Online Store > Blog posts). Each post's image, title, excerpt, date, author and tags come from Shopify.",
      "Layout: Grid shows cards in rows; Featured shows the newest post large with the next ones beside it; List shows image and text side by side.",
      "Only posts tagged: type a Shopify tag (for example Recipes) to show just those posts. Leave empty for all.",
      "The excerpt is the Excerpt field of the post in Shopify. If it is empty, nothing is shown there.",
      "New posts show within a few minutes. To see one at once, press Refresh from Shopify at the top of this page.",
    ],
    icon: Newspaper,
    blank: { title: "From the journal", blogHandle: "news", limit: 3, layout: "grid", readMoreLabel: "Read the story" },
    fields: [
      content,
      ...heading("Title"),
      { kind: "textarea", key: "description", label: "Description", max: 400 },
      { kind: "handle", key: "blogHandle", label: "Blog", source: "Blogs", hint: "Shopify's default blog is news." },
      { kind: "number", key: "limit", label: "How many posts", hint: "1 to 12" },
      { kind: "text", key: "tag", label: "Only posts tagged", hint: "Optional. A tag from your Shopify posts.", max: 80 },
      ...cta("cta", "Link"),
      { kind: "divider", key: "_posts", label: "Posts" },
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        options: [
          { value: "grid", label: "Grid of cards" },
          { value: "featured", label: "Newest post large, others beside it" },
          { value: "list", label: "List: image beside text" },
        ],
      },
      {
        kind: "select",
        key: "columns",
        label: "Cards per row (grid)",
        options: [
          { value: "3", label: "3" },
          { value: "2", label: "2" },
          { value: "4", label: "4" },
        ],
      },
      { kind: "toggle", key: "showExcerpt", label: "Show excerpt" },
      { kind: "toggle", key: "showDate", label: "Show date" },
      { kind: "toggle", key: "showAuthor", label: "Show author" },
      { kind: "toggle", key: "showTags", label: "Show tags" },
      { kind: "text", key: "readMoreLabel", label: "Link text under each post", hint: "For example: Read the story. Empty for none.", max: 40 },
      ...look(),
    ],
  },
  shopifyPage: {
    label: "Shopify page",
    description: "Text from a page you write in Shopify, such as About us.",
    help: [
      "Shows a page written in Shopify admin (Online Store > Pages), so you can edit the wording in Shopify with its rich text editor.",
      "Show the whole page, or only its first lines with a Read more button to the full page at /pages/handle.",
      "Add an image to place the text beside it. Images, bold text and links inside the page are kept; anything unsafe is removed.",
      "The section hides itself if the page does not exist or is not visible on the Headless channel.",
    ],
    icon: FileText,
    blank: { pageHandle: "", showTitle: true, excerptOnly: true },
    fields: [
      content,
      { kind: "handle", key: "pageHandle", label: "Shopify page", source: "Shopify pages" },
      { kind: "text", key: "eyebrow", label: "Small line above", hint: "Shown as a pill. Optional.", max: 80 },
      { kind: "toggle", key: "showTitle", label: "Show the page title as the heading" },
      { kind: "text", key: "titleAccent", label: "Heading, highlighted line", hint: "Optional, shown under the title.", max: 120 },
      { kind: "toggle", key: "excerptOnly", label: "Only the first lines, with Read more", hint: "Off shows the whole page." },
      ...cta("cta", "Button"),
      { kind: "divider", key: "_image", label: "Image" },
      { kind: "image", key: "image.src", label: "Image", hint: "Optional." },
      { kind: "text", key: "image.alt", label: "Image description" },
      { kind: "select", key: "imageSide", label: "Image position", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      ...look(),
    ],
  },
  brandStatement: {
    label: "Brand statement",
    description: "One large sentence with an optional button.",
    help: ["One large sentence about the brand, with an optional name underneath and a button.", "Short and specific reads best: one or two lines on a computer."],
    icon: Quote,
    blank: { text: "One sentence about the brand." },
    fields: [
      content,
      { kind: "textarea", key: "text", label: "Statement", max: 400 },
      { kind: "text", key: "attribution", label: "Attribution", max: 120 },
      ...cta("cta", "Button"),
      ...look({ align: false }),
    ],
  },
  newsletter: {
    label: "Newsletter sign-up",
    description: "An email sign-up form.",
    help: ["An email sign-up box. Keep the promise in the description honest: how often you send and what is in it."],
    icon: Mail,
    blank: { title: "Join our list" },
    fields: [
      content,
      { kind: "text", key: "title", label: "Title", max: 160 },
      { kind: "textarea", key: "description", label: "Description", max: 400 },
      ...look({ align: false }),
    ],
  },
};

/** Optional text that must be left out (not saved as "") when empty. Required fields are kept so the check names them. */
const REQUIRED = new Set(["title", "text", "body", "collectionHandle", "productHandle", "blogHandle", "pageHandle"]);

/** Drops half-filled optional parts so an empty button, image or number never reaches the page. */
function clean(section: Obj): Obj {
  const next: Obj = { ...section };
  for (const key of ["primaryCta", "secondaryCta", "cta"]) {
    const value = next[key] as { label?: string; href?: string } | undefined;
    if (value && !(value.label?.trim() && value.href?.trim())) delete next[key];
  }
  const image = next.image as { src?: string; alt?: string } | undefined;
  if (image && !image.src?.trim()) delete next.image;
  else if (image) next.image = { ...image, alt: image.alt ?? "" };
  const stat = next.stat as Record<string, unknown> | undefined;
  if (stat && !String(stat.value ?? "").trim() && stat.source !== "shopifyOrders") delete next.stat;
  else if (stat) {
    const tidy: Record<string, unknown> = { value: String(stat.value ?? ""), label: String(stat.label ?? "") };
    for (const [key, value] of Object.entries(stat)) if (value !== "" && value !== undefined && !(key in tidy)) tidy[key] = value;
    next.stat = tidy;
  }
  if (Array.isArray(next.tabs)) next.tabs = (next.tabs as { label?: string; collectionHandle?: string }[]).filter((tab) => tab.label?.trim() && tab.collectionHandle?.trim());
  if (Array.isArray(next.cards)) next.cards = (next.cards as { title?: string }[]).filter((card) => card.title?.trim());
  const refs = (list: unknown) => (Array.isArray(list) ? (list as { handle?: string; label?: string }[]).filter((ref) => ref.handle?.trim()).map((ref) => (ref.label?.trim() ? ref : { handle: ref.handle })) : list);
  if (Array.isArray(next.products)) next.products = refs(next.products);
  if (next.type === "testimonials" && Array.isArray(next.items)) {
    next.items = (next.items as Record<string, unknown>[]).map((item) => {
      const tidy = { ...item };
      if (tidy.rating === "" || tidy.rating === undefined) delete tidy.rating;
      else tidy.rating = Number(tidy.rating);
      if (!String(tidy.avatar ?? "").trim()) delete tidy.avatar;
      if (!String(tidy.detail ?? "").trim()) delete tidy.detail;
      return tidy;
    });
  }
  const menu = next.menu as { items?: unknown; title?: string; linkLabel?: string; linkHref?: string } | undefined;
  if (menu) {
    const tidy: Record<string, unknown> = { items: refs(menu.items ?? []) };
    for (const key of ["title", "linkLabel", "linkHref"] as const) if (menu[key]?.trim()) tidy[key] = menu[key];
    next.menu = tidy;
  }
  const bundle = next.bundle as { productHandle?: string; size?: number; lead?: string; linkLabel?: string } | undefined;
  if (bundle && !(bundle.productHandle?.trim() && bundle.linkLabel?.trim())) delete next.bundle;
  else if (bundle) next.bundle = { productHandle: bundle.productHandle, size: bundle.size ?? 3, linkLabel: bundle.linkLabel, ...(bundle.lead?.trim() ? { lead: bundle.lead } : {}) };
  for (const [key, value] of Object.entries(next)) {
    if (value === "" && !REQUIRED.has(key)) delete next[key];
    if (Array.isArray(value) && !value.length && (key === "tabs" || key === "cards" || key === "products")) delete next[key];
  }
  for (const [key, fallback] of [["background", "default"], ["shape", "flat"], ["spacing", "normal"], ["backdrop", "none"]] as const) {
    if (next[key] === fallback) delete next[key];
  }
  return next;
}

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-control text-muted hover:bg-foreground/8 hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

const newDraftId = () => `d-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export function SectionsEditor({ sections }: { sections: SectionConfig[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Obj[]>(sections as unknown as Obj[]);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(sections);

  // Live preview of the unsaved draft.
  const [previewOpen, setPreviewOpen] = useState(false);
  // Made on first use in the browser, never while the page is prerendered.
  const draftIdRef = useRef<string | null>(null);
  const draftId = () => (draftIdRef.current ??= newDraftId());
  const [version, setVersion] = useState(0);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const latest = useRef(0);

  useEffect(() => {
    if (!previewOpen) return;
    const run = ++latest.current;
    const timer = window.setTimeout(async () => {
      setPreviewBusy(true);
      const result = await saveHomepageDraftAction(draftId(), draft.map(clean));
      if (run !== latest.current) return;
      setPreviewBusy(false);
      if (result.ok) {
        setPreviewError(null);
        setVersion((n) => n + 1);
      } else setPreviewError(result.error);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [draft, previewOpen]);

  const update = (next: Obj[]) => {
    setDraft(next);
    setStatus(null);
  };
  const uniqueId = (base: string) => {
    const taken = new Set(draft.map((section) => section.id));
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    return id;
  };
  const move = (from: number, to: number) => {
    const next = [...draft];
    next.splice(to, 0, next.splice(from, 1)[0]);
    update(next);
  };
  const addSection = (type: SectionType) => {
    const id = uniqueId(type.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
    const section = { id, type, enabled: true, ...structuredClone(TYPES[type].blank) };
    // Insert under the open section, or at the end.
    const at = open ? draft.findIndex((s) => s.id === open) + 1 : draft.length;
    update([...draft.slice(0, at), section, ...draft.slice(at)]);
    setOpen(id);
    setAdding(false);
  };

  function save(value: Obj[] | null, done?: string) {
    startTransition(async () => {
      const result = await saveSettingsAction({ "homepage.sections": value === null ? null : value.map(clean) });
      if (result.ok) {
        setStatus({ kind: "saved", text: done ?? result.note });
        router.refresh();
      } else {
        setStatus({ kind: "error", text: result.errors?.["homepage.sections"] ?? result.error });
      }
    });
  }

  const editor = (
    <div className="flex min-w-0 flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {draft.map((section, index) => {
          const meta = TYPES[section.type as SectionType];
          if (!meta) return null;
          const Icon = meta.icon;
          const id = String(section.id);
          const expanded = open === id;
          const summary = String(section.title ?? section.text ?? (Array.isArray(section.items) ? (section.items as { text?: string }[]).map((i) => i.text).filter(Boolean).join(" · ") : ""));
          return (
            <li key={id} className={cn("rounded-lg border border-border bg-background", !section.enabled && "opacity-70", expanded && "ring-1 ring-foreground/15")}>
              <div className="flex items-center gap-1 p-2 pl-3">
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : id)} className="flex min-h-10 min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground/6 text-muted">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {meta.label}
                      {!section.enabled ? <span className="font-normal text-muted"> (hidden)</span> : null}
                    </span>
                    {summary ? <span className="block truncate text-xs text-muted">{summary}</span> : null}
                  </span>
                  <ChevronDown aria-hidden className={cn("ml-auto size-4 shrink-0 text-muted transition-transform", expanded && "rotate-180")} />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={section.enabled ? `Hide ${meta.label}` : `Show ${meta.label}`}
                  title={section.enabled ? "Shown on the homepage" : "Hidden"}
                  onClick={() => update(draft.map((other, i) => (i === index ? { ...other, enabled: !other.enabled } : other)))}
                >
                  {section.enabled ? <Eye aria-hidden className="size-4" /> : <EyeOff aria-hidden className="size-4" />}
                </button>
                <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${meta.label} up`}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button type="button" className={iconButton} disabled={index === draft.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${meta.label} down`}>
                  <ArrowDown aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  className={cn(iconButton, "max-sm:hidden")}
                  aria-label={`Duplicate ${meta.label}`}
                  onClick={() => {
                    const copy = { ...structuredClone(section), id: uniqueId(`${id}-copy`) };
                    update([...draft.slice(0, index + 1), copy, ...draft.slice(index + 1)]);
                    setOpen(String(copy.id));
                  }}
                >
                  <Copy aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Delete ${meta.label}`}
                  onClick={() => {
                    if (window.confirm(`Delete the "${meta.label}" section? This cannot be undone after saving.`)) update(draft.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
              {expanded ? (
                <div className={cn("grid gap-5 border-t border-border p-5", !previewOpen && "sm:grid-cols-2")}>
                  <details open className="group/help rounded-md border border-border bg-foreground/4 sm:col-span-2">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                      <Info aria-hidden className="size-4 shrink-0 text-muted" />
                      How to use this section
                      <ChevronDown aria-hidden className="ml-auto size-4 text-muted transition-transform group-open/help:rotate-180" />
                    </summary>
                    <ul className="flex list-disc flex-col gap-1.5 px-4 pb-4 pl-10 text-sm text-muted">
                      {meta.help.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </details>
                  {meta.fields.map((field) => (
                    <div key={field.key} className={wide(field) && !previewOpen ? "sm:col-span-2" : undefined}>
                      <FieldEditor field={field} value={section} onChange={(next) => update(draft.map((other, i) => (i === index ? next : other)))} />
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {adding ? (
        <div className="rounded-lg border border-dashed border-border bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Add a section{open ? " below the open one" : ""}</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
          <ul className={cn("grid gap-2", previewOpen ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {(Object.keys(TYPES) as SectionType[]).map((type) => {
              const { icon: Icon, label, description } = TYPES[type];
              return (
                <li key={type}>
                  <button type="button" onClick={() => addSection(type)} className="flex h-full w-full items-start gap-3 rounded-md border border-border p-3 text-left hover:border-foreground/40 hover:bg-foreground/4">
                    <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
                    <span>
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs text-muted">{description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <Button type="button" variant="outline" className="self-start" onClick={() => setAdding(true)}>
          <Plus aria-hidden className="size-4" /> Add a section
        </Button>
      )}

      <div className={cn("sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 sm:-mx-8 sm:px-8", previewOpen && "gap-2 sm:mx-0 sm:px-0")}>
        <Button onClick={() => save(draft)} loading={pending} disabled={!dirty} size={previewOpen ? "sm" : "md"}>
          Save homepage
        </Button>
        <Button variant="outline" size={previewOpen ? "sm" : "md"} onClick={() => setPreviewOpen((value) => !value)} aria-pressed={previewOpen}>
          <Eye aria-hidden className="size-4" /> {previewOpen ? "Hide preview" : "Live preview"}
        </Button>
        <Button
          variant="ghost"
          size={previewOpen ? "sm" : "md"}
          disabled={pending}
          onClick={() => {
            if (window.confirm("Replace the homepage with the one written in config/homepage.config.ts?")) save(null, "Reset. Reload the page to see the default sections.");
          }}
        >
          {previewOpen ? "Reset" : "Reset to defaults"}
        </Button>
        <p role="status" className={cn("text-sm", status?.kind === "error" ? "font-medium text-danger" : "text-muted")}>
          {status?.text ?? (dirty ? "Unsaved changes" : "")}
        </p>
      </div>
    </div>
  );

  if (!previewOpen) return editor;

  return (
    <div data-wide className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
      {editor}
      <div className="xl:sticky xl:top-20 xl:self-start">
        <HomepagePreview
          src={`/dashboard/draft?id=${draftId()}&v=${version}`}
          focusId={open}
          busy={previewBusy}
          error={previewError}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    </div>
  );
}
