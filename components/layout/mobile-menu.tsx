"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import type { NavItem, NavLink } from "@/config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  items: NavItem[];
  /** Account, wishlist, search and similar, shown under the main items. */
  utilityLinks: NavLink[];
  className?: string;
}

export function MobileMenu({ items, utilityLinks, className }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className={cn(
          "-ml-2 inline-flex size-11 items-center justify-center rounded-control hover:bg-foreground/8",
          className,
        )}
      >
        <Menu aria-hidden className="size-6" />
      </SheetTrigger>

      <SheetContent title="Menu" side="left">
        <nav aria-label="Main" className="px-5 pb-8">
          <Accordion type="multiple">
            {items.map((item) =>
              item.groups?.length ? (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger className="type-h3">{item.label}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-5">
                    {item.groups.map((group) => (
                      <div key={group.title}>
                        <p className="type-small mb-1 text-muted">{group.title}</p>
                        <ul>
                          {group.links.map((link) => (
                            <li key={link.href + link.label}>
                              <SiteLink
                                href={link.href}
                                external={link.external}
                                onClick={close}
                                className="flex min-h-11 items-center text-lg"
                              >
                                {link.label}
                              </SiteLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={item.label} className="border-b border-border">
                  <SiteLink
                    href={item.href}
                    external={item.external}
                    onClick={close}
                    className="type-h3 flex min-h-14 items-center py-3"
                  >
                    {item.label}
                  </SiteLink>
                </div>
              ),
            )}
          </Accordion>

          {utilityLinks.length ? (
            <ul className="mt-6">
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <SiteLink
                    href={link.href}
                    external={link.external}
                    onClick={close}
                    className="flex min-h-11 items-center text-muted hover:text-foreground"
                  >
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
