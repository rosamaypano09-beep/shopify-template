import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLoading } from "@/components/dashboard/settings-page";
import { SectionsEditor } from "@/components/dashboard/sections-editor";
import { PageHeader } from "@/components/dashboard/shell";
import { getDashboardConfig } from "@/lib/dashboard/values";

export const metadata: Metadata = { title: "Homepage" };

async function Editor() {
  const { sections } = (await getDashboardConfig()).homepage;
  return <SectionsEditor key={JSON.stringify(sections)} sections={sections} />;
}

export default function HomepageEditorPage() {
  return (
    <>
      <PageHeader
        title="Homepage"
        description="Sections appear on the homepage in this order. Open one to edit its wording, reorder with the arrows, or untick Show to hide it. Use Add a section for testimonials, a logo row, image with text and more."
      />
      <Suspense fallback={<DashboardLoading />}>
        <Editor />
      </Suspense>
    </>
  );
}
