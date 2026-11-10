import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSiteConfig } from "@/config";
import { LoginForm } from "@/components/dashboard/login-form";
import { isDashboardEnabled, passwordRequired } from "@/lib/dashboard/access";

export const metadata: Metadata = { title: "Sign in | Store Builder", robots: { index: false, follow: false } };

export default function LoginPage() {
  if (!isDashboardEnabled()) notFound();
  if (!passwordRequired()) redirect("/dashboard");
  return (
    <div className="dashboard flex min-h-dvh flex-1 items-center justify-center bg-surface p-4 text-foreground" data-mode="light">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-md">
        <h1 className="text-lg font-semibold">Store Builder</h1>
        <p className="mt-1 text-sm text-muted">{getSiteConfig().store.name}</p>
        <LoginForm />
      </div>
    </div>
  );
}
