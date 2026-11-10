"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Forward to an error monitor here once one is connected (see lib/logger.ts).
    console.error(error);
  }, [error]);

  return (
    <div className="container-site flex flex-col items-start gap-6 py-section">
      <h1 className="type-h1 max-w-[18ch]">This page didn&apos;t load.</h1>
      <p className="type-body-lg max-w-[50ch] text-muted">
        The store couldn&apos;t be reached just now. Try again, and if it keeps happening, come back in a few
        minutes.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Button asChild variant="link">
          <Link href="/">Go to the home page</Link>
        </Button>
      </div>
    </div>
  );
}
