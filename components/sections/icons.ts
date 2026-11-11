import {
  Apple, Award, BadgeCheck, Baby, Banana, Bike, Building2, Cake, CakeSlice, Calendar, Camera, Candy, Carrot, Check, ChefHat,
  Cherry, CircleCheck, Citrus, Clock, Coffee, Cookie, CreditCard, Croissant, Crown, CupSoda, Dessert, Donut, Egg, Feather,
  Flame, Flower, Flower2, Gem, Gift, Globe, Grape, Hand, Handshake, Headset, Heart, HeartHandshake, House, IceCreamCone,
  Infinity as InfinityIcon, Leaf, Lollipop, MapPin, Medal, MessageCircle, Milk, Moon, Music, Package, Palette, PartyPopper,
  Phone, Pizza, Plane, Popcorn, Recycle, Ribbon, RotateCcw, Salad, Sandwich, Ship, ShieldCheck, ShoppingBag, Smile, Snowflake,
  Soup, Sparkles, Sprout, Star, Store, Sun, ThumbsUp, Timer, Trophy, Truck, Users, Utensils, Vegan, Wallet, Wheat, Wine, Zap,
  type LucideIcon,
} from "lucide-react";
import type { SectionIconName } from "@/lib/section-icons";

export { SECTION_ICON_GROUPS, SECTION_ICON_NAMES } from "@/lib/section-icons";

/** Drawings for every icon name in lib/section-icons.ts. */
export const sectionIcons: Record<SectionIconName, LucideIcon> = {
  cake: Cake, "cake-slice": CakeSlice, cookie: Cookie, croissant: Croissant, dessert: Dessert, donut: Donut, candy: Candy,
  lollipop: Lollipop, "ice-cream": IceCreamCone, coffee: Coffee, cup: CupSoda, milk: Milk, wine: Wine, egg: Egg, wheat: Wheat,
  cherry: Cherry, citrus: Citrus, apple: Apple, grape: Grape, banana: Banana, carrot: Carrot, salad: Salad, soup: Soup,
  sandwich: Sandwich, pizza: Pizza, popcorn: Popcorn, chef: ChefHat, utensils: Utensils, flame: Flame, vegan: Vegan,
  gift: Gift, party: PartyPopper, heart: Heart, "heart-hands": HeartHandshake, sparkles: Sparkles, star: Star, crown: Crown,
  gem: Gem, ribbon: Ribbon, award: Award, medal: Medal, trophy: Trophy, music: Music, camera: Camera, palette: Palette,
  feather: Feather,
  truck: Truck, bike: Bike, plane: Plane, ship: Ship, package: Package, bag: ShoppingBag, store: Store, building: Building2,
  pin: MapPin, clock: Clock, timer: Timer, calendar: Calendar, phone: Phone, chat: MessageCircle, support: Headset,
  shield: ShieldCheck, badge: BadgeCheck, return: RotateCcw, card: CreditCard, wallet: Wallet, handshake: Handshake,
  leaf: Leaf, sprout: Sprout, flower: Flower, blossom: Flower2, sun: Sun, moon: Moon, snowflake: Snowflake, globe: Globe,
  home: House, users: Users, baby: Baby, smile: Smile, "thumbs-up": ThumbsUp, hand: Hand, recycle: Recycle,
  infinity: InfinityIcon, zap: Zap, check: Check, "check-circle": CircleCheck,
};
