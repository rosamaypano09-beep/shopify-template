import { Star } from "lucide-react";
import Image from "next/image";
import type { TestimonialsSectionConfig } from "@/config";
import { cn } from "@/lib/utils";
import { Section, SectionHeader } from "./section";
import { TestimonialCarousel } from "./testimonial-carousel";

type Item = TestimonialsSectionConfig["items"][number];

/** "Maria Santos" → "MS"; "Bea" → "B". First name and surname, at most two letters. */
export function nameInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter((word) => /\p{L}/u.test(word));
  if (!words.length) return "";
  const first = words[0].match(/\p{L}/u)?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1].match(/\p{L}/u)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Quote marks typed into the text are dropped: the card draws its own. */
const cleanQuote = (quote: string) => quote.trim().replace(/^["“”'‘’]+|["“”'‘’]+$/g, "").trim();

function Avatar({ item }: { item: Item }) {
  if (item.avatar) {
    return (
      <span className="relative block size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/40">
        <Image src={item.avatar} alt="" fill sizes="48px" className="object-cover" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_oklab,var(--color-primary)_55%,var(--color-accent)))] font-heading text-base font-bold tracking-wide text-primary-foreground ring-2 ring-primary/25"
    >
      {nameInitials(item.name)}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <p className="flex gap-0.5 text-highlight" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} aria-hidden className={cn("size-4", index < rating ? "fill-current" : "opacity-30")} />
      ))}
    </p>
  );
}

function Card({ item, large }: { item: Item; large?: boolean }) {
  return (
    <figure
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 p-6 transition-colors duration-(--ce-motion-base) hover:border-primary/50 sm:p-8",
        large && "lg:p-12",
      )}
    >
      {/* A large brand-coloured quotation mark, drawn once instead of typed into the text. */}
      <span aria-hidden className={cn("font-heading leading-none text-highlight select-none", large ? "text-7xl sm:text-8xl" : "text-6xl")}>
        &ldquo;
      </span>
      {item.rating ? (
        <div className="mt-1 mb-3">
          <Stars rating={item.rating} />
        </div>
      ) : null}
      <blockquote className={cn("flex-1", large ? "flex items-center font-heading text-[1.375rem] leading-snug sm:text-[1.75rem] lg:text-[2rem]" : "type-body-lg leading-relaxed")}>
        <p>{cleanQuote(item.quote)}</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3.5 border-t border-border pt-5 sm:mt-8">
        <Avatar item={item} />
        <span className="flex min-w-0 flex-col">
          <span className="font-semibold">{item.name}</span>
          {item.detail ? <span className="type-small text-muted">{item.detail}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}

/** Customer quotes as cards, a featured layout or a swipeable row. Hidden when there are none; never filled with invented ones. */
export function Testimonials({ config }: { config: TestimonialsSectionConfig }) {
  const items = config.items.filter((item) => item.quote.trim() && item.name.trim());
  if (!items.length) return null;
  const layout = config.layout ?? "grid";
  const key = (item: Item) => item.name + item.quote.slice(0, 24);

  return (
    <Section config={config}>
      <SectionHeader eyebrow={config.eyebrow} titleAccent={config.titleAccent} align={config.align} title={config.title} />
      {layout === "carousel" ? (
        <TestimonialCarousel label={config.title}>
          {items.map((item) => (
            <Card key={key(item)} item={item} />
          ))}
        </TestimonialCarousel>
      ) : layout === "featured" && items.length > 1 ? (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Card item={items[0]} large />
          <ul className="grid gap-4 sm:gap-6">
            {items.slice(1, 3).map((item) => (
              <li key={key(item)}>
                <Card item={item} />
              </li>
            ))}
          </ul>
          {items.length > 3 ? (
            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:col-span-2 lg:grid-cols-3">
              {items.slice(3).map((item) => (
                <li key={key(item)}>
                  <Card item={item} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <ul className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={key(item)}>
              <Card item={item} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
