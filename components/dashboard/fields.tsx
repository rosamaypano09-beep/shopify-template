"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveSettingsAction } from "@/lib/dashboard/actions";
import { getPath, setPath } from "@/lib/merge";
import { cn } from "@/lib/utils";

export type Field =
  | { kind: "text" | "textarea" | "url" | "email"; key: string; label: string; hint?: string; max?: number }
  | { kind: "number"; key: string; label: string; hint?: string }
  | { kind: "color"; key: string; label: string; hint?: string }
  | { kind: "toggle"; key: string; label: string; hint?: string }
  | { kind: "select"; key: string; label: string; hint?: string; options: { value: string; label: string }[] }
  | { kind: "list"; key: string; label: string; hint?: string }
  | { kind: "items"; key: string; label: string; hint?: string; fields: Field[]; blank: Record<string, unknown>; addLabel: string };

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

  if (field.kind === "items") {
    const items = Array.isArray(current) ? (current as Obj[]) : [];
    const move = (from: number, to: number) => {
      const next = [...items];
      next.splice(to, 0, next.splice(from, 1)[0]);
      set(next);
    };
    return (
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">{field.label}</legend>
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 rounded-md border border-border p-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              {field.fields.map((sub) => (
                <div key={sub.key} className={sub.kind === "textarea" ? "sm:col-span-2" : undefined}>
                  <FieldEditor
                    field={sub}
                    value={item}
                    onChange={(next) => set(items.map((other, i) => (i === index ? next : other)))}
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${field.label} ${index + 1} up`}>
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button type="button" className={iconButton} disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${field.label} ${index + 1} down`}>
                <ArrowDown aria-hidden className="size-4" />
              </button>
              <button type="button" className={iconButton} onClick={() => set(items.filter((_, i) => i !== index))} aria-label={`Remove ${field.label} ${index + 1}`}>
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => set([...items, { ...field.blank }])}>
          <Plus aria-hidden className="size-4" /> {field.addLabel}
        </Button>
        {footer}
      </fieldset>
    );
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
      <select id={id} value={typeof current === "string" ? current : ""} onChange={(event) => set(event.target.value)} aria-describedby={describedBy} className={inputClass}>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (field.kind === "color") {
    const hex = typeof current === "string" ? current : "#000000";
    control = (
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000"} onChange={(event) => set(event.target.value.toUpperCase())} aria-label={`${field.label} picker`} className="size-10 shrink-0 cursor-pointer rounded-control border border-border bg-background p-1" />
        <input id={id} value={hex} onChange={(event) => set(event.target.value)} spellCheck={false} maxLength={7} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className={cn(inputClass, "font-mono aria-invalid:border-danger")} />
      </div>
    );
  } else if (field.kind === "number") {
    control = (
      <input id={id} type="number" inputMode="decimal" value={typeof current === "number" ? current : ""} onChange={(event) => set(event.target.value === "" ? undefined : Number(event.target.value))} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className={cn(inputClass, "aria-invalid:border-danger")} />
    );
  } else if (field.kind === "list") {
    control = (
      <input
        id={id}
        value={Array.isArray(current) ? current.join(", ") : ""}
        onChange={(event) => set(event.target.value.split(",").map((part) => part.trim()).filter(Boolean))}
        spellCheck={false}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, "aria-invalid:border-danger")}
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
      <label htmlFor={id} className="text-sm font-medium">
        {field.label}
      </label>
      {control}
      {footer}
    </div>
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
