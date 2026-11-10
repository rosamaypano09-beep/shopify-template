import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getStoreHealth } from "@/lib/dashboard/health";

export const metadata: Metadata = { title: "Overview" };

async function Health() {
  const health = await getStoreHealth();
  const problems = health.issues.filter((issue) => issue.level === "problem");
  const warnings = health.issues.filter((issue) => issue.level === "warning");
  const stat = "rounded-lg border border-border bg-background p-5";

  return (
    <>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className={stat}>
          <dt className="text-sm text-muted">Shopify connection</dt>
          <dd className="mt-1 text-lg font-semibold">
            {health.connection === "live" ? "Connected" : health.connection === "demo" ? "Demo catalog" : "Not reachable"}
          </dd>
          <dd className="mt-1 text-xs break-all text-muted">
            {health.storeDomain ?? "No store connected. Add the two Shopify values to .env.local."}
          </dd>
        </div>
        <div className={stat}>
          <dt className="text-sm text-muted">Products on the site</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">
            {health.productCount}
            {health.productCountCapped ? "+" : ""}
          </dd>
        </div>
        <div className={stat}>
          <dt className="text-sm text-muted">Collections</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums">{health.collectionCount}</dd>
        </div>
      </dl>

      <section className="mt-8 rounded-lg border border-border bg-background p-5 sm:p-6">
        <h2 className="text-base font-semibold">Store health</h2>
        {health.issues.length ? (
          <>
            <p className="mt-1 text-sm text-muted">
              {problems.length} to fix, {warnings.length} to review.
            </p>
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {[...problems, ...warnings].map((issue) => (
                <li key={issue.message} className="flex gap-3 py-3">
                  {issue.level === "problem" ? (
                    <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
                  ) : (
                    <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
                  )}
                  <div className="text-sm">
                    <p>
                      <span className="font-semibold">
                        {issue.level === "problem" ? "Fix" : "Review"}, {issue.area}:
                      </span>{" "}
                      {issue.message}
                    </p>
                    <p className="mt-0.5 text-muted">{issue.fix}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-sm">
            <CheckCircle2 aria-hidden className="size-5 text-success" /> Nothing needs attention.
          </p>
        )}
      </section>

      <p className="mt-6 text-sm text-muted">
        Orders, revenue, customers, products and collections are managed in Shopify admin. This dashboard only changes
        how the storefront looks and reads.
      </p>
    </>
  );
}

export default function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="Whether the store is connected, and what to fix before launch." />
      <Suspense fallback={<Skeleton className="h-64" />}>
        <Health />
      </Suspense>
    </>
  );
}
