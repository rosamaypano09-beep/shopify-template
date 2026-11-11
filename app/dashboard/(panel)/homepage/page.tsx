import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLoading } from "@/components/dashboard/settings-page";
import { SectionsEditor } from "@/components/dashboard/sections-editor";
import { PageHeader } from "@/components/dashboard/shell";
import { LinkSuggestionsProvider } from "@/components/dashboard/link-input";
import { OrderCountStatus } from "@/components/dashboard/order-count-status";
import { RefreshShopifyButton } from "@/components/dashboard/refresh-shopify";
import { getLinkSuggestions } from "@/lib/dashboard/links";
import { getDashboardConfig } from "@/lib/dashboard/values";

export const metadata: Metadata = { title: "Homepage" };

async function Editor() {
  const [config, suggestions] = await Promise.all([getDashboardConfig(), getLinkSuggestions()]);
  const { sections } = config.homepage;
  return (
    <LinkSuggestionsProvider suggestions={suggestions}>
      <SectionsEditor key={JSON.stringify(sections)} sections={sections} />
    </LinkSuggestionsProvider>
  );
}

export default function HomepageEditorPage() {
  return (
    <>
      <PageHeader
        title="Homepage"
        description="Sections appear on the homepage in this order. Open one to edit it and read how it works, reorder with the arrows, and use the eye to hide or show it. Live preview shows your changes before you save."
      />
      <RefreshShopifyButton className="-mt-4 mb-6" />
      <Suspense fallback={null}>
        <OrderCountStatus />
      </Suspense>
      <Suspense fallback={<DashboardLoading />}>
        <Editor />
      </Suspense>
    </>
  );
}
