"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  ExternalLink,
  Home,
  LayoutList,
  LogOut,
  ShoppingBag,
  Menu as MenuIcon,
  Monitor,
  Moon,
  Palette,
  Search,
  Settings2,
  Store,
  Sun,
  ToggleRight,
  Type,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { logoutAction } from "@/lib/dashboard/auth-actions";
import { cn } from "@/lib/utils";

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords?: string;
}

const NAV: NavEntry[] = [
  { href: "/dashboard", label: "Overview", icon: Home, keywords: "health status connection" },
  { href: "/dashboard/branding", label: "Branding", icon: Palette, keywords: "theme colours colors preset cards" },
  { href: "/dashboard/store", label: "Store details", icon: Store, keywords: "name contact email social shipping" },
  { href: "/dashboard/homepage", label: "Homepage", icon: LayoutList, keywords: "sections hero edit" },
  { href: "/dashboard/navigation", label: "Navigation", icon: MenuIcon, keywords: "menu header announcement" },
  { href: "/dashboard/seo", label: "SEO", icon: Type, keywords: "title description search" },
  { href: "/dashboard/features", label: "Features", icon: ToggleRight, keywords: "wishlist reviews quick view switches" },
  { href: "/dashboard/shopify", label: "Shopify", icon: ShoppingBag, keywords: "products collections discounts blog orders add" },
  { href: "/dashboard/preview", label: "Preview", icon: Monitor, keywords: "desktop tablet mobile" },
];

const MODE_KEY = "ce:dashboard-mode";
const MODE_EVENT = "ce:dashboard-mode";
const subscribe = (callback: () => void) => {
  window.addEventListener(MODE_EVENT, callback);
  return () => window.removeEventListener(MODE_EVENT, callback);
};
function readMode(): "light" | "dark" {
  try {
    const saved = window.localStorage.getItem(MODE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // fall through
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function CommandPalette({
  open,
  mode,
  onOpenChange,
  onToggleMode,
}: {
  open: boolean;
  mode: "light" | "dark";
  onOpenChange: (open: boolean) => void;
  onToggleMode: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const commands = [
    ...NAV.map((entry) => ({ label: entry.label, hint: "Go to", keywords: entry.keywords ?? "", run: () => router.push(entry.href) })),
    { label: "Open the store in a new tab", hint: "Action", keywords: "view site", run: () => window.open("/", "_blank", "noopener") },
    { label: "Switch light or dark mode", hint: "Action", keywords: "theme appearance", run: onToggleMode },
  ];
  const term = query.trim().toLowerCase();
  const results = commands.filter((command) => `${command.label} ${command.keywords}`.toLowerCase().includes(term));
  const current = Math.min(active, Math.max(0, results.length - 1));
  const choose = (index: number) => {
    const command = results[index];
    if (!command) return;
    onOpenChange(false);
    command.run();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setQuery("");
          setActive(0);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content
          aria-describedby={undefined}
          className="dashboard fixed top-[15vh] left-1/2 z-50 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg"
          data-mode={mode}
        >
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search aria-hidden className="size-4 text-muted" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive(Math.min(results.length - 1, current + 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive(Math.max(0, current - 1));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  choose(current);
                }
              }}
              placeholder="Search settings and actions"
              aria-label="Search settings and actions"
              role="combobox"
              aria-expanded
              aria-controls="command-results"
              aria-activedescendant={results.length ? `command-${current}` : undefined}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
          <ul id="command-results" role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
            {results.length ? (
              results.map((command, index) => (
                <li
                  key={command.label}
                  id={`command-${index}`}
                  role="option"
                  aria-selected={index === current}
                  onPointerMove={() => setActive(index)}
                  onClick={() => choose(index)}
                  className={cn("flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-sm", index === current && "bg-foreground/8")}
                >
                  {command.label}
                  <span className="text-xs text-muted">{command.hint}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-6 text-sm text-muted">Nothing matches. Try &ldquo;colours&rdquo; or &ldquo;menu&rdquo;.</li>
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DashboardShell({
  storeName,
  canSignOut,
  live,
  children,
}: {
  storeName: string;
  canSignOut: boolean;
  /** True on the deployed site, where saving publishes through GitHub. */
  live: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const mode = useSyncExternalStore(subscribe, readMode, () => "light" as const);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const current = [...NAV].reverse().find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`)) ?? NAV[0];

  const toggleMode = () => {
    try {
      window.localStorage.setItem(MODE_KEY, mode === "dark" ? "light" : "dark");
    } catch {
      // The choice lasts for this visit only.
    }
    window.dispatchEvent(new Event(MODE_EVENT));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const topButton = "inline-flex h-9 items-center gap-2 rounded-control px-3 text-sm font-medium hover:bg-foreground/8";

  return (
    <div className="dashboard flex min-h-dvh flex-1 flex-col bg-surface text-foreground lg:flex-row" data-mode={mode}>
      <aside className="shrink-0 border-border bg-background max-lg:border-b lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:border-r">
        <div className="flex h-14 items-center gap-2 px-5">
          <Settings2 aria-hidden className="size-4 text-muted" />
          <p className="truncate text-sm font-semibold">
            Store Builder <span className="font-normal text-muted">/ {storeName}</span>
          </p>
        </div>
        <nav aria-label="Dashboard" className="px-3 pb-3">
          <ul className="flex gap-1 max-lg:overflow-x-auto lg:flex-col">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = current.href === href;
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-control px-3 text-sm font-medium",
                      active ? "bg-foreground/8 text-foreground" : "text-muted hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    <Icon aria-hidden className="size-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            Dashboard <span aria-hidden>/</span> <span className="font-medium text-foreground">{current.label}</span>
          </nav>
          <div className="flex items-center gap-1">
            <button type="button" className={cn(topButton, "border border-border text-muted")} onClick={() => setPaletteOpen(true)}>
              <Search aria-hidden className="size-4" />
              <span className="max-sm:sr-only">Search</span>
              <kbd className="rounded border border-border px-1.5 text-[0.6875rem] max-sm:hidden">Ctrl K</kbd>
            </button>
            <button type="button" className={topButton} onClick={toggleMode} aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {mode === "dark" ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
            </button>
            <a href="/" target="_blank" rel="noopener" className={topButton}>
              <ExternalLink aria-hidden className="size-4" />
              <span className="max-sm:sr-only">View store</span>
            </a>
            {canSignOut ? (
              <form action={logoutAction}>
                <button type="submit" className={topButton}>
                  <LogOut aria-hidden className="size-4" />
                  <span className="max-sm:sr-only">Sign out</span>
                </button>
              </form>
            ) : null}
          </div>
        </header>
        {live ? (
          <p className="border-b border-border bg-secondary px-4 py-2 text-center text-xs text-secondary-foreground sm:px-8">
            You are editing the live site. Each save is published in about a minute.
          </p>
        ) : null}
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-8 has-[[data-wide]]:max-w-none">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} mode={mode} onOpenChange={setPaletteOpen} onToggleMode={toggleMode} />
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 max-w-[65ch] text-sm text-muted">{description}</p>
    </div>
  );
}
