"use client";

import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { SectionConfig } from "@/config/types";
import { saveSettingsAction } from "@/lib/dashboard/actions";
import { cn } from "@/lib/utils";
import { FieldEditor, type Field } from "./fields";

type Obj = Record<string, unknown>;
type SectionType = SectionConfig["type"];

const backgroundField: Field = {
  kind: "select",
  key: "background",
  label: "Background",
  options: [
    { value: "default", label: "Page background" },
    { value: "surface", label: "Tinted band" },
    { value: "primary", label: "Brand colour band" },
  ],
};
const cta = (key: string, label: string): Field[] => [
  { kind: "text", key: `${key}.label`, label: `${label} text`, max: 60 },
  { kind: "text", key: `${key}.href`, label: `${label} link`, hint: "For example /collections/best-sellers" },
];

const TYPES: Record<SectionType, { label: string; blank: Obj; fields: Field[] }> = {
  hero: {
    label: "Hero",
    blank: { variant: "split", title: "Your headline", subtitle: "" },
    fields: [
      { kind: "text", key: "title", label: "Headline", max: 160 },
      { kind: "textarea", key: "subtitle", label: "Supporting text", max: 400 },
      { kind: "select", key: "variant", label: "Layout", options: [{ value: "split", label: "Text beside image" }, { value: "centered", label: "Text above image" }] },
      ...cta("primaryCta", "Main button"),
      ...cta("secondaryCta", "Second link"),
      { kind: "text", key: "image.src", label: "Image file", hint: "A file in the public folder, for example /brand/hero.jpg" },
      { kind: "text", key: "image.alt", label: "Image description", hint: "Read aloud by screen readers" },
    ],
  },
  benefits: {
    label: "Benefits row",
    blank: { items: [{ icon: "truck", title: "Benefit", body: "" }] },
    fields: [
      {
        kind: "items",
        key: "items",
        label: "Benefit",
        addLabel: "Add benefit",
        hint: "Only list what the store really offers.",
        blank: { icon: "badge", title: "", body: "" },
        fields: [
          { kind: "text", key: "title", label: "Title", max: 80 },
          { kind: "select", key: "icon", label: "Icon", options: ["truck", "shield", "leaf", "return", "support", "badge", "heart", "clock"].map((value) => ({ value, label: value })) },
          { kind: "textarea", key: "body", label: "Text", max: 240 },
        ],
      },
    ],
  },
  collectionGrid: {
    label: "Collection tiles",
    blank: { title: "Shop by category", handles: [] },
    fields: [
      { kind: "text", key: "title", label: "Title", max: 160 },
      { kind: "textarea", key: "description", label: "Description", max: 400 },
      { kind: "list", key: "handles", label: "Collection handles", hint: "Separated by commas, in display order" },
      backgroundField,
    ],
  },
  featuredProducts: {
    label: "Products from a collection",
    blank: { title: "Best sellers", collectionHandle: "best-sellers", limit: 4 },
    fields: [
      { kind: "text", key: "title", label: "Title", max: 160 },
      { kind: "textarea", key: "description", label: "Description", max: 400 },
      { kind: "text", key: "collectionHandle", label: "Collection handle" },
      { kind: "number", key: "limit", label: "How many products", hint: "1 to 12" },
      ...cta("cta", "Link"),
      backgroundField,
    ],
  },
  brandStatement: {
    label: "Brand statement",
    blank: { text: "One sentence about the brand." },
    fields: [
      { kind: "textarea", key: "text", label: "Statement", max: 400 },
      { kind: "text", key: "attribution", label: "Attribution", max: 120 },
      ...cta("cta", "Button"),
      backgroundField,
    ],
  },
  newsletter: {
    label: "Newsletter sign-up",
    blank: { title: "Join our list" },
    fields: [
      { kind: "text", key: "title", label: "Title", max: 160 },
      { kind: "textarea", key: "description", label: "Description", max: 400 },
      backgroundField,
    ],
  },
  testimonials: {
    label: "Testimonials",
    blank: { title: "What customers say", items: [{ quote: "", name: "", detail: "" }] },
    fields: [
      { kind: "text", key: "title", label: "Title", max: 160 },
      {
        kind: "items",
        key: "items",
        label: "Testimonial",
        addLabel: "Add testimonial",
        hint: "Real customers only, quoted with their permission. Rows without a quote and a name are not shown.",
        blank: { quote: "", name: "", detail: "" },
        fields: [
          { kind: "text", key: "name", label: "Customer name", max: 80 },
          { kind: "text", key: "detail", label: "Detail", hint: "For example a city, or the product they bought", max: 80 },
          { kind: "textarea", key: "quote", label: "What they said", max: 600 },
        ],
      },
      backgroundField,
    ],
  },
  logoMarquee: {
    label: "Logo row (trusted by)",
    blank: { title: "Trusted by", animated: true, items: [{ name: "", logo: "", href: "" }] },
    fields: [
      { kind: "text", key: "title", label: "Small heading", hint: "For example: Trusted by, As seen in, Our partners", max: 80 },
      { kind: "toggle", key: "animated", label: "Scroll sideways", hint: "Needs four or more logos. Stands still for visitors who prefer less motion." },
      {
        kind: "items",
        key: "items",
        label: "Brand",
        addLabel: "Add brand",
        hint: "Only organisations that really work with or feature the store.",
        blank: { name: "", logo: "", href: "" },
        fields: [
          { kind: "text", key: "name", label: "Name", max: 60 },
          { kind: "text", key: "logo", label: "Logo file", hint: "For example /brand/partners/acme.svg. Leave empty to show the name as text." },
          { kind: "text", key: "href", label: "Link (optional)" },
        ],
      },
      backgroundField,
    ],
  },
  imageText: {
    label: "Image with text",
    blank: { title: "A heading", body: "A short paragraph.", imageSide: "left" },
    fields: [
      { kind: "text", key: "title", label: "Heading", max: 160 },
      { kind: "textarea", key: "body", label: "Text", max: 1200 },
      { kind: "text", key: "image.src", label: "Image file", hint: "A file in the public folder, for example /brand/story.jpg" },
      { kind: "text", key: "image.alt", label: "Image description" },
      { kind: "select", key: "imageSide", label: "Image position", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      ...cta("cta", "Button"),
      backgroundField,
    ],
  },
  faq: {
    label: "Questions and answers",
    blank: { title: "Questions", items: [{ question: "", answer: "" }] },
    fields: [
      { kind: "text", key: "title", label: "Title", max: 160 },
      {
        kind: "items",
        key: "items",
        label: "Question",
        addLabel: "Add question",
        blank: { question: "", answer: "" },
        fields: [
          { kind: "text", key: "question", label: "Question", max: 200 },
          { kind: "textarea", key: "answer", label: "Answer", max: 1500 },
        ],
      },
      ...cta("cta", "Link"),
      backgroundField,
    ],
  },
};

/** Drops half-filled optional parts so an empty button or image never reaches the page. */
function clean(section: Obj): Obj {
  const next: Obj = { ...section };
  for (const key of ["primaryCta", "secondaryCta", "cta"]) {
    const value = next[key] as { label?: string; href?: string } | undefined;
    if (value && !(value.label?.trim() && value.href?.trim())) delete next[key];
  }
  const image = next.image as { src?: string; alt?: string } | undefined;
  if (image && !image.src?.trim()) delete next.image;
  else if (image) next.image = { ...image, alt: image.alt ?? "" };
  for (const key of ["subtitle", "description", "attribution", "title"]) {
    if (next[key] === "" && key !== "title") delete next[key];
  }
  if (next.background === "default") delete next.background;
  return next;
}

const iconButton =
  "inline-flex size-9 items-center justify-center rounded-control text-muted hover:bg-foreground/8 hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

export function SectionsEditor({ sections }: { sections: SectionConfig[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Obj[]>(sections as unknown as Obj[]);
  const [open, setOpen] = useState<string | null>(null);
  const [newType, setNewType] = useState<SectionType>("featuredProducts");
  const [status, setStatus] = useState<{ kind: "saved" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(sections);

  const update = (next: Obj[]) => {
    setDraft(next);
    setStatus(null);
  };
  const uniqueId = (base: string) => {
    const taken = new Set(draft.map((section) => section.id));
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    return id;
  };
  const move = (from: number, to: number) => {
    const next = [...draft];
    next.splice(to, 0, next.splice(from, 1)[0]);
    update(next);
  };

  function save(value: Obj[] | null, done?: string) {
    startTransition(async () => {
      const result = await saveSettingsAction({ "homepage.sections": value === null ? null : value.map(clean) });
      if (result.ok) {
        setStatus({ kind: "saved", text: done ?? result.note });
        router.refresh();
      } else {
        setStatus({ kind: "error", text: result.errors?.["homepage.sections"] ?? result.error });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {draft.map((section, index) => {
          const meta = TYPES[section.type as SectionType];
          const id = String(section.id);
          const expanded = open === id;
          const summary = String(section.title ?? section.text ?? "");
          return (
            <li key={id} className={cn("rounded-lg border border-border bg-background", !section.enabled && "opacity-70")}>
              <div className="flex items-center gap-1 p-2 pl-4">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : id)}
                  className="flex min-h-10 min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted transition-transform", expanded && "rotate-180")} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {meta.label}
                      {!section.enabled ? <span className="font-normal text-muted"> (hidden)</span> : null}
                    </span>
                    {summary ? <span className="block truncate text-xs text-muted">{summary}</span> : null}
                  </span>
                </button>
                <label className="flex items-center gap-2 px-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={Boolean(section.enabled)}
                    onChange={(event) => update(draft.map((other, i) => (i === index ? { ...other, enabled: event.target.checked } : other)))}
                    className="size-4"
                  />
                  Show
                </label>
                <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${meta.label} up`}>
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button type="button" className={iconButton} disabled={index === draft.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${meta.label} down`}>
                  <ArrowDown aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Duplicate ${meta.label}`}
                  onClick={() => {
                    const copy = { ...structuredClone(section), id: uniqueId(`${id}-copy`) };
                    update([...draft.slice(0, index + 1), copy, ...draft.slice(index + 1)]);
                    setOpen(String(copy.id));
                  }}
                >
                  <Copy aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  className={iconButton}
                  aria-label={`Delete ${meta.label}`}
                  onClick={() => {
                    if (window.confirm(`Delete the "${meta.label}" section? This cannot be undone after saving.`)) update(draft.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </div>
              {expanded ? (
                <div className="grid gap-5 border-t border-border p-5 sm:grid-cols-2">
                  {meta.fields.map((field) => (
                    <div key={field.key} className={field.kind === "items" || field.kind === "textarea" ? "sm:col-span-2" : undefined}>
                      <FieldEditor field={field} value={section} onChange={(next) => update(draft.map((other, i) => (i === index ? next : other)))} />
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-section-type" className="text-sm font-medium">
            Add a section
          </label>
          <select
            id="new-section-type"
            value={newType}
            onChange={(event) => setNewType(event.target.value as SectionType)}
            className="h-10 rounded-control border border-border bg-background px-3 text-sm"
          >
            {(Object.keys(TYPES) as SectionType[]).map((type) => (
              <option key={type} value={type}>
                {TYPES[type].label}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const id = uniqueId(newType.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
            update([...draft, { id, type: newType, enabled: true, ...structuredClone(TYPES[newType].blank) }]);
            setOpen(id);
          }}
        >
          <Plus aria-hidden className="size-4" /> Add
        </Button>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface px-4 py-3 sm:-mx-8 sm:px-8">
        <Button onClick={() => save(draft)} loading={pending} disabled={!dirty}>
          Save homepage
        </Button>
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Replace the homepage with the one written in config/homepage.config.ts?")) save(null, "Reset. Reload the page to see the default sections.");
          }}
        >
          Reset to defaults
        </Button>
        <p role="status" className={cn("text-sm", status?.kind === "error" ? "font-medium text-danger" : "text-muted")}>
          {status?.text ?? (dirty ? "Unsaved changes" : "")}
        </p>
      </div>
    </div>
  );
}
