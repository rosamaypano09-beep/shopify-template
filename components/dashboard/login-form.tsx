"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/dashboard/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        error={state.error || undefined}
        className="rounded-control"
      />
      <Button type="submit" loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
