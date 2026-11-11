import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreChrome } from "@/components/layout/store-chrome";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { readDraft } from "@/lib/dashboard/draft";
import { assertAdmin } from "@/lib/dashboard/session";

export const metadata: Metadata = { title: "Homepage draft", robots: { index: false, follow: false } };

/**
 * The homepage with unsaved edits, shown inside the homepage editor's live
 * preview. Admin only (proxy.ts and assertAdmin), never indexed, never cached.
 */
async function Draft({ searchParams }: PageProps<"/dashboard/draft">) {
  await assertAdmin();
  const { id } = await searchParams;
  const sections = typeof id === "string" ? await readDraft(id) : null;

  return (
    <StoreChrome>
      {sections ? (
        <SectionRenderer sections={sections} />
      ) : (
        <p className="container-site py-section text-muted">Make a change in the editor to see it here.</p>
      )}
    </StoreChrome>
  );
}

export default function DraftPreviewPage(props: PageProps<"/dashboard/draft">) {
  return (
    <Suspense fallback={null}>
      <Draft {...props} />
    </Suspense>
  );
}
