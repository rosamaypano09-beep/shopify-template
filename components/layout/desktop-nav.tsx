"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/config";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex h-11 items-center gap-1 rounded-control px-3 text-[0.9375rem] font-medium hover:bg-foreground/8";

/**
 * Desktop navigation. Items with `groups` open a full-width mega menu on
 * hover or click; it closes on Escape, on leaving, and when focus moves away.
 */
export function DesktopNav({ items, className }: { items: NavItem[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion();

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const close = useCallback(() => {
    cancelClose();
    setOpenIndex(null);
  }, [cancelClose]);

  // A short delay forgives a diagonal mouse path between trigger and panel.
  const closeSoon = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), 140);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className={className}
      onPointerLeave={(event) => event.pointerType === "mouse" && closeSoon()}
      onPointerEnter={cancelClose}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || openIndex === null) return;
        const trigger = navRef.current?.querySelector<HTMLButtonElement>(`[data-nav-trigger="${openIndex}"]`);
        close();
        trigger?.focus();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
      <LazyMotion features={domAnimation}>
        <ul className="flex items-center gap-1">
          {items.map((item, index) => (
            <li key={item.label}>
              {item.groups?.length ? (
                <button
                  type="button"
                  data-nav-trigger={index}
                  aria-expanded={openIndex === index}
                  aria-controls={openIndex === index ? panelId : undefined}
                  className={cn(linkClass, openIndex === index && "bg-foreground/8")}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    cancelClose();
                    setOpenIndex(index);
                  }}
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-4 transition-transform duration-(--ce-motion-fast)",
                      openIndex === index && "rotate-180",
                    )}
                  />
                </button>
              ) : null}
              {item.groups?.length ? (
                // Rendered right after its trigger so Tab moves from the button into the panel.
                <AnimatePresence>
                  {openIndex === index ? (
                    <MegaPanel id={panelId} item={item} reduceMotion={Boolean(reduceMotion)} onNavigate={close} />
                  ) : null}
                </AnimatePresence>
              ) : (
                <SiteLink
                  href={item.href}
                  external={item.external}
                  className={linkClass}
                  onPointerEnter={(event) => event.pointerType === "mouse" && close()}
                >
                  {item.label}
                </SiteLink>
              )}
            </li>
          ))}
        </ul>
      </LazyMotion>
    </nav>
  );
}

interface MegaPanelProps {
  id: string;
  item: NavItem;
  reduceMotion: boolean;
  onNavigate: () => void;
}

function MegaPanel({ id, item, reduceMotion, onNavigate }: MegaPanelProps) {
  if (!item.groups) return null;

  return (
    <m.div
      id={id}
      initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-full border-y border-border bg-background shadow-md"
    >
      <div className="container-site grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)] gap-10 py-10">
        {item.groups.map((group) => (
          <div key={group.title}>
            <p className="type-small mb-3 text-muted">{group.title}</p>
            <ul className="flex flex-col">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <SiteLink
                    href={link.href}
                    external={link.external}
                    onClick={onNavigate}
                    className="type-h4 inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {item.feature ? (
          <SiteLink
            href={item.feature.href}
            onClick={onNavigate}
            className="group/feature col-start-4 flex items-center gap-5 rounded-lg bg-surface p-4"
          >
            {item.feature.image ? (
              <ShopImage src={item.feature.image} alt="" sizes="140px" className="w-32 shrink-0 rounded-md" />
            ) : null}
            <span className="flex flex-col gap-1.5">
              <span className="type-h4 underline-offset-4 group-hover/feature:underline">{item.feature.title}</span>
              <span className="type-small text-muted">{item.feature.description}</span>
            </span>
          </SiteLink>
        ) : null}
      </div>
    </m.div>
  );
}
