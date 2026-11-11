import { CircleAlert, CircleCheck } from "lucide-react";
import { assertAdmin } from "@/lib/dashboard/session";
import { getDashboardConfig } from "@/lib/dashboard/values";
import { getOrderCountStatus } from "@/lib/shopify";
import { cn } from "@/lib/utils";

/** Shown when a homepage section counts orders from Shopify: whether that works, and whether the count covers every order. */
export async function OrderCountStatus({ always = false }: { always?: boolean }) {
  await assertAdmin();
  const { homepage } = await getDashboardConfig();
  const stats = homepage.sections.flatMap((section) => (section.type === "featureBand" && section.stat?.source === "shopifyOrders" ? [section.stat] : []));
  if (!stats.length && !always) return null;
  const status = await getOrderCountStatus();
  const baseline = stats[0]?.baseline ?? 0;

  let ok = false;
  let text: string;
  if (!status.connected) {
    text =
      status.reason === "not-configured"
        ? "Order count: not connected. Add SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET (see .env.example). The typed number is shown meanwhile."
        : "Order count: Shopify could not be reached, or the app is not installed. The typed number is shown meanwhile.";
  } else if (!status.allTime) {
    text = `Order count: connected, ${status.count} Shopify ${status.count === 1 ? "order" : "orders"}${baseline ? ` + ${baseline.toLocaleString()} earlier = ${(baseline + status.count).toLocaleString()}` : ""}. Only the last 60 days are counted, so the number can go down. Add the read_all_orders scope to the app (Dev Dashboard > Versions), release, and approve the update in Shopify admin.`;
  } else {
    ok = true;
    text = `Order count: connected, counting every order. ${status.count.toLocaleString()} in Shopify${baseline ? ` + ${baseline.toLocaleString()} earlier = ${(baseline + status.count).toLocaleString()}` : ""}.`;
  }

  return (
    <p className={cn("mb-6 flex items-start gap-2 rounded-md border px-3 py-2 text-xs", ok ? "border-border text-muted" : "border-warning/50 bg-warning/10 text-foreground")}>
      {ok ? <CircleCheck aria-hidden className="mt-px size-4 shrink-0 text-success" /> : <CircleAlert aria-hidden className="mt-px size-4 shrink-0 text-warning" />}
      {text}
    </p>
  );
}
