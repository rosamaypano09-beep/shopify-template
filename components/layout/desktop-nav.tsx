"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { NavItem, NavigationConfig } from "@/config";
import { ShopImage } from "@/components/ui/shop-image";
import { SiteLink } from "@/components/ui/site-link";
import { cn } from "@/lib/utils";

type Header = NavigationConfig["header"];

export interface DesktopNavOptions {
  linkStyle: NonNullable<Header["linkStyle"]>;
  uppercase: boolean;
  viewAll: boolean;
}

const styles: Record<DesktopNavOptions["linkStyle"], { base: string; active: string }> = {
  pill: { base: "rounded-control px-3.5 hover:bg-foreground/8", active: "bg-foreground/8" },
  underline: {
    base: "px-3 after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-(--ce-motion-base) hover:after:scale-x-100",
    active: "after:scale-x-100",
  },
  plain: { base: "px-3 text-foreground/75 hover:text-foreground", active: "text-foreground" },
};

/** True when `href` is the current page, or a section the current page lives in. */
function matches(pathname: string, href: string) {
  if (!href.startsWith("/")) return false;
  const path = href.split(/[?#]/)[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isActive(pathname: string, item: NavItem) {
  if (item.groups?.length) return item.groups.some((group) => group.links.some((link) => matches(pathname, link.href)));
  return matches(pathname, item.href);
}

/**
 * Desktop navigation. Items with `groups` open a full-width mega menu on
 * hover or click; it closes on Escape, on leaving, and when focus moves away.
 * The current page is marked for sighted and screen reader users.
 */
export function DesktopNav({ items, options, className }: { items: NavItem[]; options: DesktopNavOptions; className?: string }) {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion();
  const style = styles[options.linkStyle];
  const linkClass = cn(
    "relative inline-flex h-11 items-center gap-1 text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-(--ce-motion-fast)",
    options.uppercase && "text-[0.8125rem] tracking-[0.12em] uppercase",
    style.base,
  );

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
        <ul className="flex items-center gap-0.5">
          {items.map((item, index) => {
            const active = isActive(pathname, item);
            const open = openIndex === index;
            return (
              <li key={`${item.label}-${index}`}>
                {item.groups?.length ? (
                  <>
                    <button
                      type="button"
                      data-nav-trigger={index}
                      aria-expanded={open}
                      aria-controls={open ? panelId : undefined}
                      className={cn(linkClass, (open || active) && style.active)}
                      onClick={() => setOpenIndex(open ? null : index)}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "mouse") return;
                        cancelClose();
                        setOpenIndex(index);
                      }}
                    >
                      {item.label}
                      <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-(--ce-motion-fast)", open && "rotate-180")} />
                    </button>
                    {/* Rendered right after its trigger so Tab moves from the button into the panel. */}
                    <AnimatePresence>
                      {open ? (
                        <MegaPanel
                          id={panelId}
                          item={item}
                          pathname={pathname}
                          viewAll={options.viewAll}
                          reduceMotion={Boolean(reduceMotion)}
                          onNavigate={close}
                        />
                      ) : null}
                    </AnimatePresence>
                  </>
                ) : (
                  <SiteLink
                    href={item.href}
                    external={item.external}
                    aria-current={active ? "page" : undefined}
                    className={cn(linkClass, active && style.active)}
                    onPointerEnter={(event) => event.pointerType === "mouse" && close()}
                  >
                    {item.label}
                  </SiteLink>
                )}
              </li>
            );
          })}
        </ul>
      </LazyMotion>
    </nav>
  );
}

interface MegaPanelProps {
  id: string;
  item: NavItem;
  pathname: string;
  viewAll: boolean;
  reduceMotion: boolean;
  onNavigate: () => void;
}

function MegaPanel({ id, item, pathname, viewAll, reduceMotion, onNavigate }: MegaPanelProps) {
  if (!item.groups) return null;
  const columns = item.groups.length;
  // One equal column per group, plus a wider one for the promo tile.
  const grid: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))${item.feature ? " minmax(0, 1.35fr)" : ""}`,
  };
  const showViewAll = viewAll && item.href && item.href !== "/";

  return (
    <m.div
      id={id}
      initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 top-full border-y border-border bg-background shadow-lg"
    >
      <div className="container-site grid gap-x-12 gap-y-8 py-10" style={grid}>
        {item.groups.map((group, groupIndex) => (
          <div key={`${group.title}-${groupIndex}`} className="min-w-0">
            {group.title ? (
              <p className="type-caption mb-4 font-semibold tracking-[0.16em] text-highlight uppercase">{group.title}</p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {group.links.map((link, linkIndex) => {
                const current = matches(pathname, link.href);
                return (
                  <li key={`${link.href}-${linkIndex}`}>
                    <SiteLink
                      href={link.href}
                      external={link.external}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "group/link -mx-2 flex min-h-10 items-center justify-between gap-3 rounded-md px-2 text-base font-medium transition-colors duration-(--ce-motion-fast) hover:bg-foreground/6",
                        current ? "text-highlight" : "text-foreground/85 hover:text-foreground",
                      )}
                    >
                      {link.label}
                      <ArrowRight
                        aria-hidden
                        className="size-3.5 -translate-x-1 opacity-0 transition-[opacity,transform] duration-(--ce-motion-fast) group-hover/link:translate-x-0 group-hover/link:opacity-100"
                      />
                    </SiteLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {item.feature ? (
          <SiteLink
            href={item.feature.href}
            onClick={onNavigate}
            className="group/feature flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-(--ce-motion-base) hover:border-primary/60"
          >
            {item.feature.image ? (
              <ShopImage
                src={item.feature.image}
                alt=""
                ratio="wide"
                sizes="360px"
                imageClassName="transition-transform duration-(--ce-motion-slow) ease-brand group-hover/feature:scale-[1.04]"
              />
            ) : null}
            <span className="flex flex-col gap-1.5 p-5">
              <span className="type-h4">{item.feature.title}</span>
              {item.feature.description ? <span className="type-small text-muted">{item.feature.description}</span> : null}
              {item.feature.ctaLabel ? (
                <span className="type-small mt-2 inline-flex items-center gap-1.5 font-semibold text-highlight">
                  {item.feature.ctaLabel}
                  <ArrowRight aria-hidden className="size-3.5 transition-transform duration-(--ce-motion-fast) group-hover/feature:translate-x-0.5" />
                </span>
              ) : null}
            </span>
          </SiteLink>
        ) : null}
      </div>

      {showViewAll ? (
        <div className="border-t border-border">
          <div className="container-site flex h-12 items-center">
            <SiteLink
              href={item.href}
              external={item.external}
              onClick={onNavigate}
              className="type-small inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
            >
              View all {item.label}
              <ArrowRight aria-hidden className="size-3.5" />
            </SiteLink>
          </div>
        </div>
      ) : null}
    </m.div>
  );
}
