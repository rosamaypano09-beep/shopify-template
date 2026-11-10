"use client";

import { Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
] as const;

/** The real storefront in a frame, at three widths. Reload after saving a change elsewhere. */
export function StorePreview() {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [version, setVersion] = useState(0);
  const [path, setPath] = useState("/");
  const width = DEVICES.find((entry) => entry.id === device)?.width ?? 1280;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Screen size" className="inline-flex rounded-control border border-border bg-background p-1">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={device === id}
              onClick={() => setDevice(id)}
              className={cn("inline-flex h-8 items-center gap-2 rounded-[6px] px-3 text-sm font-medium", device === id ? "bg-foreground/10" : "text-muted hover:text-foreground")}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Page</span>
          <select value={path} onChange={(event) => setPath(event.target.value)} className="h-10 rounded-control border border-border bg-background px-3 text-sm">
            <option value="/">Homepage</option>
            <option value="/collections">Shop</option>
            <option value="/cart">Cart</option>
            <option value="/about">About</option>
            <option value="/faq">FAQ</option>
            <option value="/contact">Contact</option>
          </select>
        </label>
        <button type="button" onClick={() => setVersion((n) => n + 1)} className="inline-flex h-10 items-center gap-2 rounded-control border border-border bg-background px-3 text-sm font-medium hover:border-foreground/40">
          <RefreshCw aria-hidden className="size-4" /> Reload
        </button>
        <span className="text-xs text-muted">{width}px wide</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-background p-3">
        <iframe
          key={`${device}-${version}-${path}`}
          src={path}
          title={`Store preview, ${device}`}
          style={{ width, maxWidth: device === "desktop" ? "none" : undefined }}
          className="mx-auto block h-[70vh] rounded-md border border-border bg-white"
        />
      </div>
    </div>
  );
}
