import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getSiteConfig } from "@/config";
import { DashboardShell } from "@/components/dashboard/shell";
import { isDashboardEnabled, passwordRequired, storageKind } from "@/lib/dashboard/access";
import { isAuthorized } from "@/lib/dashboard/session";

export const metadata: Metadata = {
  title: { default: "Store Builder", template: "%s | Store Builder" },
  robots: { index: false, follow: false },
};

async function Guard({ children }: { children: ReactNode }) {
  // Signed-out visitors never get this far (see proxy.ts). This is a second lock.
  if (!(await isAuthorized())) return null;
  return (
    <DashboardShell storeName={getSiteConfig().store.name} canSignOut={passwordRequired()} live={storageKind() === "github"}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  // Not set up for this environment: every dashboard URL is "page not found".
  if (!isDashboardEnabled()) notFound();
  return (
    <Suspense fallback={null}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
