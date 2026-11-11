"use client";

import { ImageIcon, ImageOff, LoaderCircle, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { listImagesAction, uploadImageAction } from "@/lib/dashboard/media-actions";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground hover:border-foreground/40";

/** Shows an image path as a picture, with a library of the project's images and an upload button. */
export function ImageField({
  id,
  value,
  onChange,
  describedBy,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  const [library, setLibrary] = useState<string[] | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [message, setMessage] = useState<{ kind: "note" | "error"; text: string } | null>(null);
  const [broken, setBroken] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const [uploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const previewable = /^(\/|https:\/\/cdn\.shopify\.com\/)/.test(value) && broken !== value;

  function browse() {
    if (browsing) return setBrowsing(false);
    setBrowsing(true);
    if (library) return;
    startLoading(async () => {
      const result = await listImagesAction();
      if (result.ok) setLibrary(result.images);
      else setMessage({ kind: "error", text: result.error });
    });
  }

  function upload(file: File) {
    const data = new FormData();
    data.set("file", file);
    setMessage(null);
    startUpload(async () => {
      const result = await uploadImageAction(data);
      if (result.ok) {
        onChange(result.src);
        setLibrary((current) => (current ? [result.src, ...current] : current));
        setMessage({ kind: "note", text: `${result.note} Save the section to use it.` });
      } else {
        setMessage({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="relative flex aspect-[4/3] w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-[repeating-conic-gradient(var(--color-surface)_0_25%,var(--color-background)_0_50%)] bg-[length:16px_16px]">
          {value && previewable ? (
            <Image src={value} alt="" fill sizes="112px" unoptimized className="object-contain" onError={() => setBroken(value)} />
          ) : value ? (
            <ImageOff aria-hidden className="size-5 text-muted" />
          ) : (
            <ImageIcon aria-hidden className="size-5 text-muted" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex gap-1.5">
            <input
              id={id}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="/uploads/photo.jpg"
              spellCheck={false}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className={cn(inputClass, "font-mono text-xs aria-invalid:border-danger")}
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Remove image"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-control text-muted hover:bg-foreground/8 hover:text-foreground"
              >
                <X aria-hidden className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={browse} aria-expanded={browsing}>
              <ImageIcon aria-hidden className="size-4" /> {browsing ? "Close library" : "Choose from library"}
            </Button>
            <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
              <Upload aria-hidden className="size-4" /> Upload
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) upload(file);
              }}
            />
          </div>
          {value && broken === value ? (
            <p className="text-xs text-muted">No preview. Check the path, or wait for the live site to redeploy after an upload.</p>
          ) : null}
        </div>
      </div>

      {message ? (
        <p role={message.kind === "error" ? "alert" : "status"} className={cn("text-xs", message.kind === "error" ? "font-medium text-danger" : "text-muted")}>
          {message.text}
        </p>
      ) : null}

      {browsing ? (
        <div className="rounded-md border border-border p-3">
          {loading || !library ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              <LoaderCircle aria-hidden className="size-4 animate-spin" /> Loading images
            </p>
          ) : library.length ? (
            <ul className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4" aria-label="Images in the project">
              {library.map((src) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(src);
                      setBrowsing(false);
                    }}
                    aria-pressed={src === value}
                    title={src}
                    className={cn(
                      "group flex w-full flex-col gap-1 rounded-md p-1 text-left hover:bg-foreground/5",
                      src === value && "ring-2 ring-primary",
                    )}
                  >
                    <span className="relative block aspect-square overflow-hidden rounded bg-surface">
                      <Image src={src} alt="" fill sizes="120px" unoptimized className="object-contain" />
                    </span>
                    <span className="truncate font-mono text-[0.6875rem] text-muted">{src.split("/").pop()}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No images in the public folder yet. Upload one.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
