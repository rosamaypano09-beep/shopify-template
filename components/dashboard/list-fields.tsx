"use client";

import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HandleSource } from "./fields";
import { LinkInput } from "./link-input";

const inputClass =
  "h-10 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground hover:border-foreground/40";

const parse = (text: string) => text.split(",").map((part) => part.trim()).filter(Boolean);

/**
 * A comma-separated list typed as text. The text you type is kept as-is while
 * you edit (so a trailing comma or space does not vanish); the list itself is
 * what gets saved.
 */
export function ListInput({
  id,
  value,
  onChange,
  describedBy,
  invalid,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  const [text, setText] = useState(value.join(", "));
  const [focused, setFocused] = useState(false);
  // Follow outside changes (reset, duplicate) without fighting the user's typing.
  if (!focused && JSON.stringify(parse(text)) !== JSON.stringify(value)) setText(value.join(", "));
  return (
    <input
      id={id}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parse(event.target.value));
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setText(value.join(", "));
      }}
      spellCheck={false}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, "aria-invalid:border-danger")}
    />
  );
}

/**
 * An ordered list of Shopify handles shown as chips. Add by picking from the
 * store's suggestions (or typing a handle and pressing Add); reorder with the
 * arrows; remove with the cross.
 */
export function HandleChips({
  id,
  value,
  onChange,
  source,
  describedBy,
  invalid,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  source: HandleSource;
  describedBy?: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const add = (handle: string) => {
    const clean = handle.trim().replace(/^.*\//, "");
    if (clean && !value.includes(clean)) onChange([...value, clean]);
    setDraft("");
  };
  const move = (from: number, to: number) => {
    const next = [...value];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };
  const noun = ({ Products: "product", Collections: "collection", Blogs: "blog", "Shopify pages": "page" } as const)[source];

  return (
    <div className="flex flex-col gap-2">
      {value.length ? (
        <ol className="flex flex-wrap gap-2" aria-label={`Chosen ${noun}s, in display order`}>
          {value.map((handle, index) => (
            <li key={handle} className="inline-flex h-9 items-center gap-0.5 rounded-control border border-border bg-foreground/5 pr-1 pl-3 font-mono text-xs">
              <span className="mr-1 text-muted">{index + 1}.</span>
              {handle}
              <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move ${handle} earlier`} className="ml-1 inline-flex size-7 items-center justify-center rounded text-muted hover:bg-foreground/10 hover:text-foreground disabled:opacity-30">
                <ArrowLeft aria-hidden className="size-3.5" />
              </button>
              <button type="button" onClick={() => move(index, index + 1)} disabled={index === value.length - 1} aria-label={`Move ${handle} later`} className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-foreground/10 hover:text-foreground disabled:opacity-30">
                <ArrowRight aria-hidden className="size-3.5" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((other) => other !== handle))} aria-label={`Remove ${handle}`} className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-foreground/10 hover:text-danger">
                <X aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-muted">None chosen yet.</p>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <LinkInput
            id={id}
            value={draft}
            onChange={setDraft}
            onPick={(suggestion) => add(suggestion.href)}
            groups={[source]}
            handleMode
            placeholder={`Add a ${noun}: start typing its name`}
            describedBy={describedBy}
            invalid={invalid}
          />
        </div>
        <Button type="button" variant="outline" size="sm" className="h-10" disabled={!draft.trim()} onClick={() => add(draft)}>
          <Plus aria-hidden className="size-4" /> Add
        </Button>
      </div>
    </div>
  );
}
