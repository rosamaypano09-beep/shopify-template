"use client";

import { ArrowRight, Menu } from "lucide-react";
import { useState } from "react";
import type { NavItem, NavLink } from "@/config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  items: NavItem[];
  /** Account, wishlist, search and similar, shown under the main items. */
  utilityLinks: NavLink[];
  /** Add a "View all" link to each dropdown. */
  viewAll?: boolean;
  className?: string;
}

export function MobileMenu({ items, utilityLinks, viewAll = true, className }: MobileMenuProps) {
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
                    {item.groups.map((group, groupIndex) => (
                      <div key={`${group.title}-${groupIndex}`}>
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
                    {viewAll && item.href && item.href !== "/" ? (
                      <SiteLink href={item.href} external={item.external} onClick={close} className="inline-flex min-h-11 items-center gap-1.5 font-semibold">
                        View all {item.label} <ArrowRight aria-hidden className="size-4" />
                      </SiteLink>
                    ) : null}
                    {item.feature ? (
                      <SiteLink href={item.feature.href} onClick={close} className="flex items-center gap-4 rounded-lg bg-surface p-3">
                        {item.feature.image ? (
                          <ShopImage src={item.feature.image} alt="" sizes="96px" className="w-24 shrink-0 rounded-md" />
                        ) : null}
                        <span className="flex flex-col gap-1">
                          <span className="font-semibold">{item.feature.title}</span>
                          {item.feature.ctaLabel ? <span className="type-small text-highlight">{item.feature.ctaLabel}</span> : null}
                        </span>
                      </SiteLink>
                    ) : null}
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
