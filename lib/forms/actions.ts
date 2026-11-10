"use server";

import { z } from "zod";
import { getSiteConfig } from "@/config";
import { deliver } from "./delivery";

export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  /** Per-field messages, keyed by input name. */
  errors?: Record<string, string>;
}

const email = z.string().trim().toLowerCase().email().max(200);

/** A field people cannot see. Only bots fill it in. */
const honeypotFilled = (form: FormData) => String(form.get("company") ?? "") !== "";

/** A complete, valid message sent within 1.5 seconds of the page loading was not typed by a person. */
function sentTooFast(form: FormData): boolean {
  const started = Number(form.get("started"));
  return Number.isFinite(started) && started > 0 && Date.now() - started < 1500;
}

export async function subscribeAction(_previous: FormState, form: FormData): Promise<FormState> {
  // Pretend success to bots so they learn nothing.
  if (honeypotFilled(form)) return { status: "success", message: "Thanks. You're on the list." };

  const parsed = email.safeParse(form.get("email"));
  if (!parsed.success) {
    return { status: "error", message: "", errors: { email: "Enter a valid email address, like name@example.com." } };
  }
  const sent = await deliver("newsletter", { email: parsed.data, source: getSiteConfig().store.url });
  return sent
    ? { status: "success", message: "Thanks. You're on the list." }
    : { status: "error", message: "We couldn't sign you up just now. Try again in a minute." };
}

const contactInput = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
  email: email,
  message: z.string().trim().min(10, "Write at least a sentence so we can help.").max(4000),
});

export async function contactAction(_previous: FormState, form: FormData): Promise<FormState> {
  if (honeypotFilled(form)) return { status: "success", message: "Message sent. We'll reply by email." };

  const parsed = contactInput.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      errors[field] ??= field === "email" ? "Enter a valid email address, like name@example.com." : issue.message;
    }
    return { status: "error", message: "Check the highlighted fields.", errors };
  }
  if (sentTooFast(form)) return { status: "success", message: "Message sent. We'll reply by email." };
  const sent = await deliver("contact", { ...parsed.data, source: getSiteConfig().store.url });
  return sent
    ? { status: "success", message: "Message sent. We'll reply by email." }
    : { status: "error", message: "Your message couldn't be sent. Try again, or email us directly." };
}
