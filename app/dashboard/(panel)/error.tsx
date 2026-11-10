"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h1 className="text-lg font-semibold">This screen couldn&apos;t load its settings</h1>
      <p className="mt-2 max-w-[60ch] text-sm text-muted">
        On the live site, settings are read from the GitHub repository. Check that GITHUB_TOKEN can read and write the
        repository&apos;s contents and that GITHUB_REPO is spelled &quot;owner/name&quot;. The server log has the exact
        reason. Nothing was changed.
      </p>
      <Button className="mt-5" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
