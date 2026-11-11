import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = { title: "Store details" };

const social = (key: string, label: string) => ({
  kind: "text" as const,
  key: `store.social.${key}`,
  label,
  hint: "Full link starting with https://. Leave empty to hide.",
});

export default function StorePage() {
  return (
    <SettingsPage
      title="Store details"
      description="Shown in the header, footer, contact page and search results. Leave a field empty and it is not shown."
      groups={[
        {
          title: "Identity",
          fields: [
            { kind: "text", key: "store.name", label: "Store name", max: 80 },
            { kind: "textarea", key: "store.description", label: "One-sentence description", max: 300, hint: "Shown in the footer." },
          ],
        },
        {
          title: "Contact",
          columns: true,
          fields: [
            { kind: "email", key: "store.contact.email", label: "Email" },
            { kind: "text", key: "store.contact.phone", label: "Phone" },
          ],
        },
        {
          title: "Social media",
          columns: true,
          fields: [social("instagram", "Instagram"), social("facebook", "Facebook"), social("tiktok", "TikTok"), social("youtube", "YouTube"), social("pinterest", "Pinterest"), social("x", "X")],
        },
        {
          title: "Promotions",
          description: "Only shows a progress bar in the cart. The real shipping price is always Shopify's, so this must match a free-shipping rate set there.",
          fields: [{ kind: "number", key: "store.promotions.freeShippingThreshold", label: "Free shipping from (order amount)", hint: "Set to 0 to hide the progress bar." }],
        },
        {
          title: "Bag",
          columns: true,
          fields: [
            { kind: "text", key: "store.ordering.cartTitle", label: "Bag title", hint: "For example: Your bag", max: 40 },
            { kind: "textarea", key: "store.ordering.cartNote", label: "Notice above the checkout button", hint: "For example your order cut-off. Only real rules.", max: 240 },
          ],
        },
        {
          title: "Pickup or delivery date and time",
          description:
            "Customers choose a date and time in the bag before checkout. They are saved on the Shopify order (Orders > the order > Additional details). Pickup or delivery itself, delivery cost and payment are chosen in Shopify's checkout. Times follow the store's time zone.",
          columns: true,
          fields: [
            { kind: "toggle", key: "store.ordering.scheduling", label: "Ask for a date and time before checkout", hint: "Needs at least one time slot." },
            { kind: "text", key: "store.ordering.dateLabel", label: "Date heading", hint: "For example: Pickup or delivery date", max: 40 },
            { kind: "weekdays", key: "store.ordering.openDays", label: "Open days" },
            { kind: "number", key: "store.ordering.cutoffHour", label: "Cut-off hour (0–23)", hint: "16 = 4 pm. Ordering after this moves the earliest date one day later." },
            { kind: "number", key: "store.ordering.minDaysAhead", label: "Earliest date, days from today", hint: "1 = next day." },
            { kind: "number", key: "store.ordering.maxDaysAhead", label: "Latest date, days from today", hint: "For example 30." },
            { kind: "text", key: "store.ordering.timeLabel", label: "Time heading", hint: "For example: Pickup time", max: 40 },
            { kind: "list", key: "store.ordering.timeSlots", label: "Time slots", hint: "Separated by commas, for example: 10:00 AM – 12:00 PM, 2:00 PM – 4:00 PM" },
            { kind: "list", key: "store.ordering.closedDates", label: "Closed dates", hint: "Holidays, as YYYY-MM-DD separated by commas, for example 2026-12-25" },
          ],
        },
      ]}
    />
  );
}
