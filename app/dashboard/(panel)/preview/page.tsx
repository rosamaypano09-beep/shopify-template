import type { Metadata } from "next";
import { StorePreview } from "@/components/dashboard/preview";
import { PageHeader } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Preview" };

export default function PreviewPage() {
  return (
    <>
      <PageHeader title="Preview" description="The real storefront at desktop, tablet and phone widths. Press Reload after saving a change." />
      <StorePreview />
    </>
  );
}
