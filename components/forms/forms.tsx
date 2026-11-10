"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contactAction, subscribeAction, type FormState } from "@/lib/forms/actions";
import { cn } from "@/lib/utils";

const idle: FormState = { status: "idle", message: "" };

/** Hidden from people, tempting to bots. Plus the time the form was first shown. */
function SpamTraps() {
  const started = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Written straight to the field after the page loads, so server and browser HTML match.
    if (started.current) started.current.value = String(Date.now());
  }, []);
  return (
    <>
      <div aria-hidden className="absolute -left-[200vw] size-px overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={started} type="hidden" name="started" defaultValue="" />
    </>
  );
}

function Result({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn("type-small font-medium", state.status === "error" ? "text-danger" : "text-success")}
    >
      {state.message}
    </p>
  );
}

export function NewsletterForm({ className, onDark }: { className?: string; onDark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeAction, idle);
  if (state.status === "success") {
    return (
      <p role="status" className={cn("font-semibold", className)}>
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className={cn("relative flex flex-col gap-2", className)} noValidate>
      <SpamTraps />
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            label="Email address"
            hideLabel
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            error={state.errors?.email}
            className={onDark ? "border-transparent" : undefined}
          />
        </div>
        <Button type="submit" loading={pending} variant={onDark ? "accent" : "primary"}>
          Sign up
        </Button>
      </div>
      <Result state={state} />
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, idle);
  if (state.status === "success") {
    return (
      <div role="status" className="rounded-lg bg-surface p-6">
        <p className="type-h4">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="relative flex flex-col gap-5" noValidate>
      <SpamTraps />
      <Input label="Your name" name="name" autoComplete="name" required error={state.errors?.name} />
      <Input label="Email address" name="email" type="email" autoComplete="email" required error={state.errors?.email} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="type-small font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          maxLength={4000}
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={state.errors?.message ? "contact-message-error" : undefined}
          className="w-full rounded-md border border-foreground/25 bg-background p-4 text-base hover:border-foreground/50 aria-invalid:border-danger"
        />
        {state.errors?.message ? (
          <p id="contact-message-error" role="alert" className="type-caption font-medium text-danger">
            {state.errors.message}
          </p>
        ) : null}
      </div>
      <Result state={state} />
      <Button type="submit" size="lg" loading={pending} className="self-start">
        Send message
      </Button>
    </form>
  );
}
