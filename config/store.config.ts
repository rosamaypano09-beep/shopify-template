import type { StoreConfig } from "./types";

/**
 * DEMO CLIENT. "Bantay Daily" is a placeholder brand used to show the engine.
 * Replace everything in /config for a real client; nothing else needs to change.
 */
export const storeConfig: StoreConfig = {
  name: "Bantay Daily",
  description:
    "Daily supplements for Filipino dogs, made with ingredients you can read and doses based on your dog's weight.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  brand: {
    logo: { type: "text" },
    favicon: "/brand/favicon-16x16.png",
  },
  contact: {
    email: "hello@example.com",
    businessHours: [{ days: "Monday to Saturday", hours: "9:00 AM to 6:00 PM" }],
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
  locale: {
    language: "en-PH",
    country: "PH",
    currency: "PHP",
    timezone: "Asia/Manila",
  },
  promotions: {
    freeShippingThreshold: 1500,
  },

  ordering: {
    cartTitle: "Your cart",
    // Off until the store's real days, cut-off and time slots are filled in (dashboard: Store details).
    scheduling: false,
    dateLabel: "Pickup or delivery date",
    timeLabel: "Time",
    openDays: [1, 2, 3, 4, 5, 6],
    cutoffHour: 16,
    minDaysAhead: 1,
    maxDaysAhead: 30,
    timeSlots: [],
    closedDates: [],
  },
};
