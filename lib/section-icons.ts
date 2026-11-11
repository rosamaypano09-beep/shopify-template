/**
 * Icons a homepage section can show, grouped for the dashboard's icon picker.
 * Names only: components/sections/icons.ts maps each one to its drawing, and
 * TypeScript flags a name that has no drawing.
 */
export const SECTION_ICON_GROUPS = {
  "Food and baking": [
    "cake", "cake-slice", "cookie", "croissant", "dessert", "donut", "candy", "lollipop", "ice-cream", "coffee", "cup", "milk",
    "wine", "egg", "wheat", "cherry", "citrus", "apple", "grape", "banana", "carrot", "salad", "soup", "sandwich", "pizza",
    "popcorn", "chef", "utensils", "flame", "vegan",
  ],
  "Gifts and celebration": ["gift", "party", "heart", "heart-hands", "sparkles", "star", "crown", "gem", "ribbon", "award", "medal", "trophy", "music", "camera", "palette", "feather"],
  "Delivery and service": [
    "truck", "bike", "plane", "ship", "package", "bag", "store", "building", "pin", "clock", "timer", "calendar", "phone", "chat",
    "support", "shield", "badge", "return", "card", "wallet", "handshake",
  ],
  "Nature and people": ["leaf", "sprout", "flower", "blossom", "sun", "moon", "snowflake", "globe", "home", "users", "baby", "smile", "thumbs-up", "hand", "recycle", "infinity", "zap", "check", "check-circle"],
} as const;

export type SectionIconName = (typeof SECTION_ICON_GROUPS)[keyof typeof SECTION_ICON_GROUPS][number];

export const SECTION_ICON_NAMES = Object.values(SECTION_ICON_GROUPS).flat() as SectionIconName[];
