import type { NavigationConfig } from "./types";

export const navigationConfig: NavigationConfig = {
  header: {
    sticky: true,
    transparent: false,
    hideOnScroll: true,
    showSearch: true,
    showCart: true,
    showWishlist: true,
    // Needs SHOPIFY_SHOP_ID and features.customerAccounts (see SHOPIFY_SETUP.md).
    showAccount: true,
  },

  announcement: {
    enabled: true,
    message: "Free delivery on orders over ₱1,500",
    link: {
      label: "Shop our best sellers",
      href: "/collections/best-sellers",
    },
  },

  main: [
    {
      label: "Shop Pies",
      href: "/collections",
      groups: [
        {
          title: "Shop by Size",
          links: [
            {
              label: "Mini Pies",
              href: "/collections/mini-pies",
            },
            {
              label: "Whole Pies",
              href: "/collections/whole-pies",
            },
          ],
        },
        {
          title: "Shop by Flavor",
          links: [
            {
              label: "Buko & Nipa",
              href: "/collections/buko-nipa",
            },
            {
              label: "Ube & Taro",
              href: "/collections/ube-taro",
            },
            {
              label: "Cashew",
              href: "/collections/cashew",
            },
            {
              label: "Calamansi",
              href: "/collections/calamansi",
            },
          ],
        },
        {
          title: "Featured",
          links: [
            {
              label: "Best Sellers",
              href: "/collections/best-sellers",
            },
            {
              label: "Assorted Pies",
              href: "/collections/assorted-pies",
            },
            {
              label: "All Pies",
              href: "/collections",
            },
          ],
        },
      ],

      feature: {
        title: "Find Your Favorite Pie",
        description:
          "From bite-sized mini pies to generous whole pies, discover Filipino-inspired flavors made for sharing, gifting, and every sweet occasion.",
        href: "/collections/best-sellers",
        image: "/demo/products/pie-collection.jpg",
      },
    },

    {
      label: "Mini Pies",
      href: "/collections/mini-pies",
    },

    {
      label: "Whole Pies",
      href: "/collections/whole-pies",
    },

    {
      label: "Best Sellers",
      href: "/collections/best-sellers",
    },

    {
      label: "About Us",
      href: "/pages/about-us",
    },
  ],

  footer: [
    {
      title: "Shop",
      links: [
        {
          label: "All Pies",
          href: "/collections",
        },
        {
          label: "Mini Pies",
          href: "/collections/mini-pies",
        },
        {
          label: "Whole Pies",
          href: "/collections/whole-pies",
        },
        {
          label: "Assorted Pies",
          href: "/collections/assorted-pies",
        },
        {
          label: "Best Sellers",
          href: "/collections/best-sellers",
        },
      ],
    },

    {
      title: "Flavors",
      links: [
        {
          label: "Buko & Nipa",
          href: "/collections/buko-nipa",
        },
        {
          label: "Ube & Taro",
          href: "/collections/ube-taro",
        },
        {
          label: "Cashew",
          href: "/collections/cashew",
        },
        {
          label: "Calamansi",
          href: "/collections/calamansi",
        },
      ],
    },

    {
      title: "About",
      links: [
        {
          label: "About Us",
          href: "/pages/about-us",
        },
        {
          label: "Contact Us",
          href: "/pages/contact",
        },
        {
          label: "FAQs",
          href: "/pages/faqs",
        },
      ],
    },
  ],

  // Privacy, terms, refund and shipping policy links go here.
  // The text must be written or approved by the client; the engine never invents legal copy.
  policies: [],
};