import type { NavGroup, NavItem } from "@/config/types";
import type { ShopMenuItem } from "@/lib/shopify/types";

/**
 * Turns a Shopify menu (Online Store > Navigation) into header items.
 *   - An item with no children is a plain link.
 *   - An item whose children have their own children opens a mega menu with
 *     one column per child.
 *   - An item with only plain children opens a single column.
 * The parent's own link stays on the item; the dropdown shows it as "View all".
 */
export function menuToNavItems(menu: ShopMenuItem[]): NavItem[] {
  return menu.map((item) => {
    const base = { label: item.title, href: item.href, external: item.external || undefined };
    if (!item.items.length) return base;

    const groups: NavGroup[] = [];
    const loose = item.items.filter((child) => !child.items.length);
    for (const child of item.items) {
      if (child.items.length) {
        groups.push({ title: child.title, links: child.items.map(toLink) });
      }
    }
    if (loose.length) groups.unshift({ title: item.title, links: loose.map(toLink) });
    return { ...base, groups: groups.slice(0, 3) };
  });
}

function toLink(item: ShopMenuItem) {
  return { label: item.title, href: item.href, external: item.external || undefined };
}
