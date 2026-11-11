import type { PagesConfig } from "./types";

/**
 * About, FAQ and contact pages. Set enabled: false to remove a page (its URL
 * then shows "page not found"). Policy pages are not here: they come straight
 * from Shopify (Settings > Policies), so the legal text is always the client's own.
 */
export const pagesConfig: PagesConfig = {
  about: {
    enabled: true,
    // Shown at /about. Edit it in Shopify admin > Online Store > Pages > About Us.
    shopifyPage: "about-us",
    title: "Why we started Bantay Daily",
    intro:
      "We are dog owners who got tired of reading supplement labels that listed everything except the amounts.",
    blocks: [
      {
        title: "Labels you can check",
        body: "Every jar lists each active ingredient and how much is in one chew or scoop. If your vet asks what your dog is taking, you can read it straight off the label.",
        image: { src: "/demo/products/hip-joint-chews.svg", alt: "Hip and Joint Chews jar" },
      },
      {
        title: "Doses by weight",
        body: "A five-kilo Shih Tzu and a thirty-kilo Labrador should not get the same amount. Each product carries a simple weight chart so you give the right dose from day one.",
        image: { src: "/demo/products/everyday-multivitamin-chews.svg", alt: "Everyday Multivitamin Chews jar" },
      },
    ],
    cta: { label: "Browse the range", href: "/collections" },
  },
  faq: {
    enabled: true,
    title: "Questions people ask us",
    groups: [
      {
        title: "Using the supplements",
        items: [
          {
            question: "How do I know how much to give?",
            answer: "Check the weight chart on the jar. Weigh your dog, find the row, and give that amount once a day with food.",
          },
          {
            question: "Can I give more than one supplement?",
            answer: "Most dogs do well on the multivitamin plus one targeted product. Ask your vet before combining more than two, or if your dog takes medication.",
          },
        ],
      },
      {
        title: "Orders",
        items: [
          {
            question: "Where do you deliver?",
            answer: "Anywhere in the Philippines. Delivery options and costs are shown at checkout before you pay.",
          },
        ],
      },
    ],
  },
  contact: {
    enabled: true,
    title: "Talk to us",
    intro: "Questions about a product or an order? Send a message and we will reply by email.",
  },
};
