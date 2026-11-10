import type { HomepageConfig } from "./types";

/**
 * The homepage is this list, rendered top to bottom.
 * Reorder items to reorder the page, copy an item (with a new id) to
 * duplicate a section, set enabled: false to hide one.
 */
export const homepageConfig: HomepageConfig = {
  sections: [
    {
      id: "hero",
      type: "hero",
      variant: "split",
      enabled: true,
      title: "Good days start with one small scoop.",
      subtitle:
        "Supplements for joints, skin, tummies and nerves. Every label lists what is inside and how much to give for your dog's weight.",
      primaryCta: { label: "Shop best sellers", href: "/collections/best-sellers" },
      secondaryCta: { label: "Browse everything", href: "/collections" },
      image: {
        src: "/demo/Hero.png",
        alt: "Three Bantay Daily supplement jars beside a yellow ball",
        position: "center",
      },
    },
    {
      id: "benefits",
      type: "benefits",
      enabled: true,
      items: [
        {
          icon: "leaf",
          title: "Ingredients you can read",
          body: "Every active ingredient and its amount per chew is printed on the jar.",
        },
        {
          icon: "badge",
          title: "Dosed by weight",
          body: "A simple chart on each label, from 2 kg toy breeds to 40 kg and up.",
        },
        {
          icon: "truck",
          title: "Ships nationwide",
          body: "Packed to order and sent anywhere in the Philippines.",
        },
      ],
    },
    {
      id: "shop-by-need",
      type: "collectionGrid",
      enabled: true,
      title: "What does your dog need help with?",
      description: "Pick the one thing you notice most. You can always add another later.",
      handles: ["joints-mobility", "skin-coat", "digestion", "calm"],
    },
    {
      id: "best-sellers",
      type: "featuredProducts",
      enabled: true,
      background: "surface",
      title: "What other dog owners reorder",
      collectionHandle: "best-sellers",
      limit: 4,
      cta: { label: "See all best sellers", href: "/collections/best-sellers" },
    },
    {
      id: "home-faq",
      type: "faq",
      enabled: true,
      title: "Before you order",
      items: [
        {
          question: "How do I know how much to give?",
          answer: "Check the weight chart on the jar. Weigh your dog, find the row, and give that amount once a day with food.",
        },
        {
          question: "Where do you deliver?",
          answer: "Anywhere in the Philippines. Delivery options and costs are shown at checkout before you pay.",
        },
      ],
      cta: { label: "All questions", href: "/faq" },
    },
    {
      id: "newsletter",
      type: "newsletter",
      enabled: true,
      background: "surface",
      title: "One useful email a month",
      description: "Feeding tips, new products and the occasional discount. Unsubscribe any time.",
    },
    {
      id: "statement",
      type: "brandStatement",
      enabled: true,
      text: "We started Bantay Daily because the supplement aisle told us everything except what was actually in the jar.",
      cta: { label: "Browse the range", href: "/collections" },
    },
  ],
};
