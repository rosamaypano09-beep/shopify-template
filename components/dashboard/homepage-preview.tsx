"use client";

import { LoaderCircle, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEVICES = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Phone", width: 390, icon: Smartphone },
] as const;

/** Tall enough to judge a section, short enough to keep the toolbar on screen. */
const FRAME_HEIGHT = "max(30rem, calc(100dvh - 12rem))";

interface HomepagePreviewProps {
  /** Address of the draft page. Changes whenever a new draft has been stored. */
  src: string;
  /** Section to scroll to after a reload, usually the one open in the editor. */
  focusId: string | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
}

/**
 * The draft homepage in a frame, scaled to fit the panel. A new version loads
 * behind the current one and swaps in when ready, at the same scroll position,
 * so typing does not make the preview flash.
 */
export function HomepagePreview({ src, focusId, busy, error, onClose }: HomepagePreviewProps) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [shown, setShown] = useState(src);
  const [panelWidth, setPanelWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef<HTMLIFrameElement>(null);
  const lastFocus = useRef<string | null>(null);
  const width = DEVICES.find((entry) => entry.id === device)?.width ?? 1280;
  const scale = panelWidth ? Math.min(1, panelWidth / width) : 1;
  const loading = src !== shown;

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => setPanelWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Opening a section in the editor scrolls the preview to it straight away.
  useEffect(() => {
    if (!focusId || focusId === lastFocus.current) return;
    const target = shownRef.current?.contentWindow?.document.getElementById(focusId);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    lastFocus.current = focusId;
  }, [focusId]);

  function swapIn(frame: HTMLIFrameElement) {
    const previous = shownRef.current?.contentWindow?.scrollY ?? 0;
    const win = frame.contentWindow;
    if (win) {
      const target = focusId && focusId !== lastFocus.current ? win.document.getElementById(focusId) : null;
      if (target) target.scrollIntoView({ block: "start" });
      else win.scrollTo(0, previous);
    }
    lastFocus.current = focusId;
    setShown(frame.dataset.src ?? src);
  }

  const frameStyle = { width, height: `calc(${FRAME_HEIGHT} / ${scale})`, transform: `scale(${scale})`, transformOrigin: "top left" };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Screen size" className="inline-flex rounded-control border border-border bg-background p-1">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={device === id}
              onClick={() => setDevice(id)}
              className={cn("inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium", device === id ? "bg-foreground/10" : "text-muted hover:text-foreground")}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <p role="status" className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-xs text-muted">
          {busy || loading ? (
            <>
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> Updating preview
            </>
          ) : error ? (
            <span className="truncate text-danger" title={error}>
              Not updated: {error}
            </span>
          ) : (
            "Live preview of unsaved changes"
          )}
        </p>
        <button type="button" onClick={onClose} aria-label="Close preview" className="inline-flex size-9 items-center justify-center rounded-control text-muted hover:bg-foreground/8 hover:text-foreground">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      {/* A fixed height, not flex-1: the column around it has no height of its own, so flex-1 would collapse it to nothing. */}
      <div ref={boxRef} className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-background" style={{ height: FRAME_HEIGHT }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: width * scale }}>
          {/* One keyed list, so the frame that finished loading stays mounted when it becomes the visible one. */}
          {[...new Set([shown, src])].map((url) => {
            const visible = url === shown;
            return (
              <iframe
                key={url}
                ref={visible ? shownRef : undefined}
                src={url}
                data-src={url}
                title={visible ? "Homepage preview" : "Homepage preview, loading"}
                aria-hidden={visible ? undefined : true}
                tabIndex={visible ? undefined : -1}
                style={frameStyle}
                className={visible ? "block bg-background" : "pointer-events-none absolute inset-0 bg-background opacity-0"}
                onLoad={visible ? undefined : (event) => swapIn(event.currentTarget)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
