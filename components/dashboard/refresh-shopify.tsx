"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { refreshShopifyContentAction } from "@/lib/dashboard/refresh-actions";
import { cn } from "@/lib/utils";

/** Fetches products, collections, blog posts, pages and menus fresh from Shopify on the next page view. */
export function RefreshShopifyButton({ className }: { className?: string }) {
  const router = useRouter();
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await refreshShopifyContentAction();
            setNote({ ok: result.ok, text: result.note });
            if (result.ok) router.refresh();
          })
        }
      >
        <RefreshCw aria-hidden className="size-4" /> Refresh from Shopify
      </Button>
      <p role="status" className={cn("text-xs", note && !note.ok ? "font-medium text-danger" : "text-muted")}>
        {note?.text ?? "Published something in Shopify? It shows within a few minutes, or at once after a refresh."}
      </p>
    </div>
  );
}
