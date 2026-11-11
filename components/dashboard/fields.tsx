"use client";

import { ArrowDown, ArrowUp, ChevronDown, Copy, Download, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveSettingsAction } from "@/lib/dashboard/actions";
import { getPath, setPath } from "@/lib/merge";
import { cn } from "@/lib/utils";
import { importShopifyMenuAction } from "@/lib/dashboard/menu-actions";
import { IconPicker } from "./icon-picker";
import { ImageField } from "./image-field";
import { LinkInput } from "./link-input";
import { HandleChips, ListInput } from "./list-fields";

export type HandleSource = "Products" | "Collections" | "Blogs" | "Shopify pages";

export type Field =
  | { kind: "text" | "textarea" | "url" | "email"; key: string; label: string; hint?: string; max?: number }
  | { kind: "number"; key: string; label: string; hint?: string }
  /** `optional`: may be left empty to use the theme's colour. */
  | { kind: "color"; key: string; label: string; hint?: string; optional?: boolean }
  | { kind: "icon"; key: string; label: string; hint?: string }
  /** Days of the week, stored as numbers 0 (Sunday) to 6 (Saturday). */
  | { kind: "weekdays"; key: string; label: string; hint?: string }
  /** Shows how readable `fg` text is on `bg` (both sibling colour keys). Stores nothing. */
  | { kind: "contrast"; key: string; label: string; hint?: string; fg: string; bg: string }
  | { kind: "image"; key: string; label: string; hint?: string }
  /** A link with suggestions from the store. `fillLabel` names a sibling field filled with the picked title when empty. */
  | { kind: "link"; key: string; label: string; hint?: string; fillLabel?: string }
  /** A Shopify handle with suggestions from the store: products, collections or blogs. */
  | { kind: "handle"; key: string; label: string; hint?: string; source: HandleSource }
  /** A sub-heading between fields. Stores nothing. */
  | { kind: "divider"; key: string; label: string; hint?: string }
  | { kind: "toggle"; key: string; label: string; hint?: string }
  | { kind: "select"; key: string; label: string; hint?: string; options: { value: string; label: string }[] }
  | { kind: "list"; key: string; label: string; hint?: string }
  /** An ordered list of Shopify handles, picked from the store's suggestions. */
  | { kind: "handles"; key: string; label: string; hint?: string; source: HandleSource }
  | {
      kind: "items";
      key: string;
      label: string;
      hint?: string;
      fields: Field[];
      blank: Record<string, unknown>;
      addLabel: string;
      /** Show each entry as a closed row named by `summaryKey`; open one to edit it. */
      collapsible?: boolean;
      summaryKey?: string;
      max?: number;
      /** Offer "Import from Shopify menu", replacing the list with a Shopify menu. */
      importShopifyMenu?: boolean;
    };

const inputClass =
  "h-10 w-full rounded-control border border-border bg-background px-3 text-sm text-foreground hover:border-foreground/40";
const iconButton =
  "inline-flex size-9 items-center justify-center rounded-control text-muted hover:bg-foreground/8 hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

type Obj = Record<string, unknown>;

/** One labelled control. `value` is the object the field lives in; keys may be dotted ("cta.label"). */
export function FieldEditor({
  field,
  value,
  onChange,
  error,
}: {
  field: Field;
  value: Obj;
  onChange: (next: Obj) => void;
  error?: string;
}) {
  const id = useId();
  const current = getPath(value, field.key);
  const set = (next: unknown) => onChange(setPath(value, field.key, next));
  const hintId = field.hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined;

  const footer = (
    <>
      {field.hint ? (
        <p id={hintId} className="text-xs text-muted">
          {field.hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </>
  );

  if (field.kind === "toggle") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="flex min-h-10 cursor-pointer items-center justify-between gap-4 text-sm font-medium">
          {field.label}
          <input
            id={id}
            type="checkbox"
            role="switch"
            checked={Boolean(current)}
            onChange={(event) => set(event.target.checked)}
            aria-describedby={describedBy}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-11 shrink-0 rounded-full bg-foreground/20 transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-background after:transition-transform peer-checked:after:translate-x-5"
          />
        </label>
        {footer}
      </div>
    );
  }

  if (field.kind === "divider") {
    return (
      <div className="border-t border-border pt-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{field.label}</p>
        {field.hint ? <p className="mt-1 text-xs text-muted">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.kind === "items") {
    return <ItemsEditor field={field} items={Array.isArray(current) ? (current as Obj[]) : []} set={set} footer={footer} />;
  }

  let control;
  if (field.kind === "textarea") {
    control = (
      <textarea
        id={id}
        rows={3}
        maxLength={field.max}
        value={typeof current === "string" ? current : ""}
        onChange={(event) => set(event.target.value)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, "h-auto rounded-md py-2 aria-invalid:border-danger")}
      />
    );
  } else if (field.kind === "select") {
    control = (
      <select id={id} value={typeof current === "string" || typeof current === "number" ? String(current) : ""} onChange={(event) => set(event.target.value)} aria-describedby={describedBy} className={inputClass}>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.kind === "link") {
    control = (
      <LinkInput
        id={id}
        value={typeof current === "string" ? current : ""}
        onChange={(next) => set(next)}
        onPick={(suggestion) => {
          const fill = field.fillLabel;
          if (!fill || String(getPath(value, fill) ?? "").trim()) return;
          onChange(setPath(setPath(value, field.key, suggestion.href), fill, suggestion.label));
        }}
        describedBy={describedBy}
        invalid={Boolean(error)}
      />
    );
  } else if (field.kind === "handle") {
    control = (
      <LinkInput
        id={id}
        value={typeof current === "string" ? current : ""}
        onChange={(next) => set(next)}
        groups={[field.source]}
        handleMode
        placeholder={`Start typing a ${({ Products: "product", Collections: "collection", Blogs: "blog", "Shopify pages": "page" } as const)[field.source]} name`}
        describedBy={describedBy}
        invalid={Boolean(error)}
      />
    );
  } else if (field.kind === "image") {
    control = (
      <ImageField
        id={id}
        value={typeof current === "string" ? current : ""}
        onChange={(next) => set(next)}
        describedBy={describedBy}
        invalid={Boolean(error)}
      />
    );
  } else if (field.kind === "color") {
    const hex = typeof current === "string" ? current : field.optional ? "" : "#000000";
    const valid = /^#[0-9a-fA-F]{6}$/.test(hex);
    control = (
      <div className="flex items-center gap-2">
        <input type="color" value={valid ? hex : "#000000"} onChange={(event) => set(event.target.value.toUpperCase())} aria-label={`${field.label} picker`} className={cn("size-10 shrink-0 cursor-pointer rounded-control border border-border bg-background p-1", !valid && field.optional && "opacity-50")} />
        <input id={id} value={hex} placeholder={field.optional ? "Theme colour" : undefined} onChange={(event) => set(event.target.value)} spellCheck={false} maxLength={7} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className={cn(inputClass, "font-mono aria-invalid:border-danger")} />
        {field.optional && hex ? (
          <button type="button" onClick={() => set("")} className="h-10 shrink-0 rounded-control px-2 text-xs font-medium text-muted hover:bg-foreground/8 hover:text-foreground">
            Use theme
          </button>
        ) : null}
      </div>
    );
  } else if (field.kind === "weekdays") {
    const days = Array.isArray(current) ? (current as number[]) : [];
    control = (
      <div role="group" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-1.5">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
          const on = days.includes(index);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={on}
              onClick={() => set(on ? days.filter((d) => d !== index) : [...days, index].sort())}
              className={cn("h-10 min-w-12 rounded-control border px-2 text-sm font-medium", on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted hover:border-foreground/40")}
            >
              {day}
            </button>
          );
        })}
      </div>
    );
  } else if (field.kind === "icon") {
    control = <IconPicker id={id} value={typeof current === "string" ? current : ""} onChange={(next) => set(next)} />;
  } else if (field.kind === "contrast") {
    const fg = String(getPath(value, field.fg) ?? "");
    const bg = String(getPath(value, field.bg) ?? "");
    const ratio = contrastRatio(fg, bg);
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{field.label}</p>
        {ratio === null ? (
          <p className="text-xs text-muted">Choose both colours to check readability. Empty colours follow the theme, which is already checked.</p>
        ) : (
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 items-center rounded-control border border-border px-4 text-sm font-semibold" style={{ backgroundColor: bg, color: fg }}>
              Sample text
            </span>
            <p className={cn("text-xs font-medium", ratio >= 4.5 ? "text-success" : ratio >= 3 ? "text-warning" : "text-danger")}>
              Contrast {ratio.toFixed(1)}:1 —{" "}
              {ratio >= 4.5 ? "readable at every size." : ratio >= 3 ? "fine for large text only." : "too low: hard to read. Pick a lighter or darker colour."}
            </p>
          </div>
        )}
      </div>
    );
  } else if (field.kind === "number") {
    control = (
      <input id={id} type="number" inputMode="decimal" value={typeof current === "number" ? current : ""} onChange={(event) => set(event.target.value === "" ? undefined : Number(event.target.value))} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className={cn(inputClass, "aria-invalid:border-danger")} />
    );
  } else if (field.kind === "list") {
    control = (
      <ListInput id={id} value={Array.isArray(current) ? (current as string[]) : []} onChange={(next) => set(next)} describedBy={describedBy} invalid={Boolean(error)} />
    );
  } else if (field.kind === "handles") {
    control = (
      <HandleChips
        id={id}
        value={Array.isArray(current) ? (current as string[]) : []}
        onChange={(next) => set(next)}
        source={field.source}
        describedBy={describedBy}
        invalid={Boolean(error)}
      />
    );
  } else {
    control = (
      <input
        id={id}
        type={field.kind === "email" ? "email" : "text"}
        maxLength={field.max}
        value={typeof current === "string" ? current : ""}
        onChange={(event) => set(event.target.value)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, "aria-invalid:border-danger")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} id={`${id}-label`} className="text-sm font-medium">
        {field.label}
      </label>
      {control}
      {footer}
    </div>
  );
}

/** WCAG contrast ratio of two #RRGGBB colours, or null if either is missing. */
export function contrastRatio(a: string, b: string): number | null {
  const hex = /^#[0-9a-fA-F]{6}$/;
  if (!hex.test(a) || !hex.test(b)) return null;
  const luminance = (value: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const v = Number.parseInt(value.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const wide = (field: Field) => field.kind === "contrast" || field.kind === "items" || field.kind === "handles" || field.kind === "textarea" || field.kind === "image" || field.kind === "divider";

function ImportMenu({ onImport, hasItems }: { onImport: (items: Obj[]) => void; hasItems: boolean }) {
  const [handle, setHandle] = useState("main-menu");
  const [message, setMessage] = useState<{ kind: "note" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = useId();
  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={inputId} className="text-xs font-medium">
            Shopify menu handle
          </label>
          <input id={inputId} value={handle} onChange={(event) => setHandle(event.target.value)} spellCheck={false} className={cn(inputClass, "w-44 font-mono text-xs")} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={pending}
          onClick={() => {
            if (hasItems && !window.confirm("Replace the menu below with the Shopify menu? Nothing is saved until you press Save changes.")) return;
            setMessage(null);
            startTransition(async () => {
              const result = await importShopifyMenuAction(handle.trim());
              if (result.ok) {
                onImport(result.items as unknown as Obj[]);
                setMessage({ kind: "note", text: `Imported ${result.items.length} items. Edit them below, then save.` });
              } else setMessage({ kind: "error", text: result.error });
            });
          }}
        >
          <Download aria-hidden className="size-4" /> Import from Shopify menu
        </Button>
      </div>
      <p className="text-xs text-muted">
        Copies a menu from Shopify admin (Online Store &gt; Navigation) into this editor, so you can change it here.
      </p>
      {message ? (
        <p role={message.kind === "error" ? "alert" : "status"} className={cn("text-xs", message.kind === "error" ? "font-medium text-danger" : "text-muted")}>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function ItemsEditor({
  field,
  items,
  set,
  footer,
}: {
  field: Extract<Field, { kind: "items" }>;
  items: Obj[];
  set: (next: unknown) => void;
  footer: React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    set(next);
    if (open === from) setOpen(to);
  };
  const full = field.max !== undefined && items.length >= field.max;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium">{field.label}</legend>
      {field.importShopifyMenu ? <ImportMenu hasItems={items.length > 0} onImport={(next) => { set(next); setOpen(null); }} /> : null}
      {items.map((item, index) => {
        const summary = field.summaryKey ? String(getPath(item, field.summaryKey) ?? "").trim() : "";
        const expanded = !field.collapsible || open === index;
        const controls = (
          <div className={cn("flex", field.collapsible ? "flex-row" : "flex-col")}>
            <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${field.label} ${index + 1} up`}>
              <ArrowUp aria-hidden className="size-4" />
            </button>
            <button type="button" className={iconButton} disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${field.label} ${index + 1} down`}>
              <ArrowDown aria-hidden className="size-4" />
            </button>
            {field.collapsible ? (
              <button
                type="button"
                className={iconButton}
                disabled={full}
                onClick={() => {
                  set([...items.slice(0, index + 1), structuredClone(item), ...items.slice(index + 1)]);
                  setOpen(index + 1);
                }}
                aria-label={`Duplicate ${field.label} ${index + 1}`}
              >
                <Copy aria-hidden className="size-4" />
              </button>
            ) : null}
            <button
              type="button"
              className={iconButton}
              onClick={() => {
                set(items.filter((_, i) => i !== index));
                setOpen(null);
              }}
              aria-label={`Remove ${field.label} ${index + 1}`}
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
        );
        const body = (
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {field.fields.map((sub) => (
              <div key={sub.key} className={wide(sub) ? "sm:col-span-2" : undefined}>
                <FieldEditor field={sub} value={item} onChange={(next) => set(items.map((other, i) => (i === index ? next : other)))} />
              </div>
            ))}
          </div>
        );

        if (!field.collapsible) {
          return (
            <div key={index} className="flex items-start gap-2 rounded-md border border-border p-3">
              {body}
              {controls}
            </div>
          );
        }
        return (
          <div key={index} className="rounded-md border border-border bg-background">
            <div className="flex items-center gap-1 py-1 pr-1 pl-3">
              <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : index)} className="flex min-h-10 min-w-0 flex-1 items-center gap-2 text-left text-sm">
                <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted transition-transform", expanded && "rotate-180")} />
                <span className="truncate font-medium">{summary || <span className="text-muted">Untitled {field.label.toLowerCase()}</span>}</span>
              </button>
              {controls}
            </div>
            {expanded ? <div className="border-t border-border p-3">{body}</div> : null}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={full}
        onClick={() => {
          set([...items, structuredClone(field.blank)]);
          if (field.collapsible) setOpen(items.length);
        }}
      >
        <Plus aria-hidden className="size-4" /> {field.addLabel}
      </Button>
      {footer}
    </fieldset>
  );
}

export interface FieldGroup {
  title: string;
  description?: string;
  fields: Field[];
  /** Lay fields out in two columns on wide screens. */
  columns?: boolean;
}

/**
 * A settings page: groups of fields whose keys are setting paths
 * ("store.name"). Saves only what changed.
 */
export function SettingsForm({ groups, values }: { groups: FieldGroup[]; values: Record<string, unknown> }) {
  const router = useRouter();
  const [draft, setDraft] = useState(values);
  // When the saved values change (after a save or reset), start again from them.
  const signature = JSON.stringify(values);
  const [seen, setSeen] = useState(signature);
  if (seen !== signature) {
    setSeen(signature);
    setDraft(values);
  }
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const keys = groups.flatMap((group) => group.fields.map((field) => field.key));
  const changed = keys.filter((key) => JSON.stringify(draft[key]) !== JSON.stringify(values[key]));

  function submit(changes: Record<string, unknown>, done?: string) {
    startTransition(async () => {
      const result = await saveSettingsAction(changes);
      if (result.ok) {
        setErrors({});
        setStatus({ kind: "saved", text: done ?? result.note });
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setStatus({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        submit(Object.fromEntries(changed.map((key) => [key, draft[key] ?? null])));
      }}
    >
      {groups.map((group) => (
        <section key={group.title} className="rounded-lg border border-border bg-background p-5 sm:p-6">
          <h2 className="text-base font-semibold">{group.title}</h2>
          {group.description ? <p className="mt-1 text-sm text-muted">{group.description}</p> : null}
          <div className={cn("mt-5 grid gap-5", group.columns && "sm:grid-cols-2")}>
            {group.fields.map((field) => (
              <FieldEditor
                key={field.key}
                field={{ ...field, key: "v" }}
                value={{ v: draft[field.key] }}
                onChange={(next) => {
                  setDraft((current) => ({ ...current, [field.key]: next.v }));
                  setStatus(null);
                }}
                error={errors[field.key]}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 sm:-mx-8 sm:px-8">
        <Button type="submit" loading={pending} disabled={!changed.length}>
          Save changes
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Reset everything on this page to the defaults written in the config files?")) return;
            submit(Object.fromEntries(keys.map((key) => [key, null])), "Reset to defaults.");
          }}
        >
          Reset to defaults
        </Button>
        <p role="status" className={cn("text-sm", status?.kind === "error" ? "font-medium text-danger" : "text-muted")}>
          {status?.text ?? (changed.length ? `${changed.length} unsaved ${changed.length === 1 ? "change" : "changes"}` : "")}
        </p>
      </div>
    </form>
  );
}
