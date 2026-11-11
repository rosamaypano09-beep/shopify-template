import type { Collection, Money, Product, ProductVariant, ShopImage } from "../types";

/**
 * Demo catalog used when no Shopify store is connected (see lib/env.ts).
 * It mirrors real Shopify edge cases on purpose: a sale, a sold-out product,
 * a sold-out variant, single-variant products and a product with no image.
 */

const UPDATED_AT = "2026-11-01T00:00:00Z";
const php = (amount: number): Money => ({ amount: amount.toFixed(2), currencyCode: "PHP" });

const packshot = (handle: string, title: string): ShopImage => ({
  url: `/demo/products/${handle}.svg`,
  altText: `${title} pack shot`,
  width: 800,
  height: 800,
});

interface VariantSeed {
  size: string;
  price: number;
  compareAt?: number;
  available?: boolean;
}

interface ProductSeed {
  handle: string;
  title: string;
  productType: string;
  description: string;
  tags: string[];
  optionName: string;
  variants: VariantSeed[];
  collections: string[];
  image?: boolean;
}

const seeds: ProductSeed[] = [
  {
    handle: "everyday-multivitamin-chews",
    title: "Everyday Multivitamin Chews",
    productType: "Soft chews",
    description:
      "One chicken-flavoured chew a day covering vitamins A, D3, E and the B group, plus zinc and taurine. Made for adult dogs of every size, with the dose for your dog's weight printed on the jar.",
    tags: ["best-seller", "adult"],
    optionName: "Size",
    variants: [
      { size: "30 chews", price: 649 },
      { size: "60 chews", price: 1149 },
      { size: "90 chews", price: 1599 },
    ],
    collections: ["best-sellers"],
  },
  {
    handle: "hip-joint-chews",
    title: "Hip and Joint Chews",
    productType: "Soft chews",
    description:
      "Glucosamine, chondroitin, MSM and green-lipped mussel in a beef-liver chew. Suited to large breeds, older dogs and dogs that jump more than they should.",
    tags: ["best-seller", "adult", "senior"],
    optionName: "Size",
    variants: [
      { size: "60 chews", price: 799 },
      { size: "120 chews", price: 1399 },
    ],
    collections: ["best-sellers", "joints-mobility", "senior"],
  },
  {
    handle: "wild-salmon-oil",
    title: "Wild Salmon Oil",
    productType: "Oil",
    description:
      "Cold-pressed salmon oil with omega-3 EPA and DHA. Pump it over dinner; one pump per 5 kg of body weight. Dogs tend to lick the bowl clean.",
    tags: ["best-seller", "sale"],
    optionName: "Size",
    variants: [
      { size: "250 ml", price: 599, compareAt: 699 },
      { size: "500 ml", price: 999, compareAt: 1199 },
    ],
    collections: ["best-sellers", "skin-coat"],
  },
  {
    handle: "gut-probiotic-powder",
    title: "Gut Probiotic Powder",
    productType: "Powder",
    description:
      "Six probiotic strains with prebiotic inulin in an unflavoured powder. Stir one scoop into wet or dry food. Useful after antibiotics or a change of diet.",
    tags: ["best-seller"],
    optionName: "Size",
    variants: [{ size: "120 g", price: 749 }],
    collections: ["best-sellers", "digestion"],
  },
  {
    handle: "settle-calming-chews",
    title: "Settle Calming Chews",
    productType: "Soft chews",
    description:
      "L-theanine, chamomile and passionflower for thunderstorms, fireworks, grooming days and long car rides. Give 30 minutes beforehand.",
    tags: ["adult"],
    optionName: "Size",
    variants: [
      { size: "30 chews", price: 429 },
      { size: "60 chews", price: 729, available: false },
    ],
    collections: ["calm"],
  },
  {
    handle: "puppy-starter-chews",
    title: "Puppy Starter Chews",
    productType: "Soft chews",
    description:
      "DHA for developing brains, calcium for growing bones and a gentle probiotic for new tummies. For puppies from 8 weeks to 12 months.",
    tags: ["puppy"],
    optionName: "Size",
    variants: [{ size: "45 chews", price: 599 }],
    collections: ["puppy"],
  },
  {
    handle: "senior-vitality-chews",
    title: "Senior Vitality Chews",
    productType: "Soft chews",
    description:
      "Joint support, antioxidants and CoQ10 in a softer chew that is easy on older teeth. For dogs aged seven and up.",
    tags: ["senior"],
    optionName: "Size",
    variants: [{ size: "60 chews", price: 849, available: false }],
    collections: ["senior", "joints-mobility"],
  },
  {
    handle: "skin-coat-chews",
    title: "Skin and Coat Chews",
    productType: "Soft chews",
    description:
      "Biotin, zinc and omega-3 from fish oil in a salmon-flavoured chew. A tidy alternative to oil for dogs that eat away from home.",
    tags: ["adult"],
    optionName: "Size",
    variants: [
      { size: "60 chews", price: 699 },
      { size: "120 chews", price: 1249 },
    ],
    collections: ["skin-coat"],
  },
  {
    handle: "pumpkin-fibre-topper",
    title: "Pumpkin Fibre Topper",
    productType: "Powder",
    description:
      "Dried pumpkin, psyllium husk and apple fibre. Sprinkle over meals to firm things up or keep things moving.",
    tags: ["adult"],
    optionName: "Size",
    variants: [{ size: "150 g", price: 549 }],
    collections: ["digestion"],
    // No image on purpose: exercises the missing-image fallback.
    image: false,
  },
];

function buildProduct(seed: ProductSeed): Product {
  const image = seed.image === false ? null : packshot(seed.handle, seed.title);
  const variants: ProductVariant[] = seed.variants.map((variant, index) => ({
    id: `gid://mock/ProductVariant/${seed.handle}-${index + 1}`,
    title: variant.size,
    availableForSale: variant.available ?? true,
    price: php(variant.price),
    compareAtPrice: variant.compareAt ? php(variant.compareAt) : null,
    selectedOptions: [{ name: seed.optionName, value: variant.size }],
    image,
  }));
  const cheapest = [...seed.variants].sort((a, b) => a.price - b.price)[0];
  const prices = new Set(seed.variants.map((v) => v.price));

  return {
    id: `gid://mock/Product/${seed.handle}`,
    handle: seed.handle,
    title: seed.title,
    vendor: "Bantay Daily",
    availableForSale: variants.some((v) => v.availableForSale),
    tags: seed.tags,
    featuredImage: image,
    secondaryImage: null,
    price: php(cheapest.price),
    hasPriceRange: prices.size > 1,
    compareAtPrice: cheapest.compareAt ? php(cheapest.compareAt) : null,
    // The demo has no review app, so it shows no ratings. Invented reviews would be dishonest.
    rating: null,
    quickAddVariantId: variants.length === 1 && variants[0].availableForSale ? variants[0].id : null,
    description: seed.description,
    productType: seed.productType,
    images: image ? [image] : [],
    options: [{ name: seed.optionName, values: seed.variants.map((v) => v.size) }],
    variants,
    seo: { title: null, description: null },
    updatedAt: UPDATED_AT,
  };
}

export const mockProducts: Product[] = seeds.map(buildProduct);

const collectionSeeds: { handle: string; title: string; description: string }[] = [
  {
    handle: "best-sellers",
    title: "Best sellers",
    description: "The supplements our customers reorder most.",
  },
  {
    handle: "joints-mobility",
    title: "Joints and mobility",
    description: "For stiff mornings, big breeds and dogs that still think they are puppies.",
  },
  {
    handle: "skin-coat",
    title: "Skin and coat",
    description: "Omega-3, biotin and zinc for itchy skin and dull coats.",
  },
  {
    handle: "digestion",
    title: "Digestion",
    description: "Probiotics and fibre for sensitive stomachs.",
  },
  {
    handle: "calm",
    title: "Calm",
    description: "For fireworks, storms, vet visits and time alone.",
  },
  {
    handle: "puppy",
    title: "Puppies",
    description: "Gentle formulas for the first twelve months.",
  },
  {
    handle: "senior",
    title: "Seniors",
    description: "Extra support for dogs aged seven and up.",
  },
];

export const mockCollections: (Collection & { productHandles: string[] })[] = collectionSeeds.map((seed) => ({
  id: `gid://mock/Collection/${seed.handle}`,
  handle: seed.handle,
  title: seed.title,
  description: seed.description,
  image: {
    url: `/demo/collections/${seed.handle}.svg`,
    altText: "",
    width: 800,
    height: 1000,
  },
  seo: { title: null, description: null },
  updatedAt: UPDATED_AT,
  productHandles: seeds.filter((p) => p.collections.includes(seed.handle)).map((p) => p.handle),
}));
