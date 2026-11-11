import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getLinkSuggestions } from "@/lib/dashboard/links";
import { currentValues } from "@/lib/dashboard/values";
import { SettingsForm, type FieldGroup } from "./fields";
import { LinkSuggestionsProvider } from "./link-input";
import { PageHeader } from "./shell";

export function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading">
      <Skeleton className="h-40" />
      <Skeleton className="h-64" />
    </div>
  );
}

async function LoadedForm({ groups }: { groups: FieldGroup[] }) {
  const paths = groups.flatMap((group) => group.fields.map((field) => field.key));
  const [values, suggestions] = await Promise.all([currentValues(paths), getLinkSuggestions()]);
  return (
    <LinkSuggestionsProvider suggestions={suggestions}>
      <SettingsForm groups={groups} values={values} />
    </LinkSuggestionsProvider>
  );
}

/** A whole settings screen from a list of field groups. The saved values load behind a placeholder. */
export function SettingsPage({ title, description, groups }: { title: string; description: string; groups: FieldGroup[] }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Suspense fallback={<DashboardLoading />}>
        <LoadedForm groups={groups} />
      </Suspense>
    </>
  );
}
