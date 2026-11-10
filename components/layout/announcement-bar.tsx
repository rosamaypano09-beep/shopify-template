import type { NavigationConfig } from "@/config";
import { SiteLink } from "@/components/ui/site-link";

export function AnnouncementBar({ announcement }: { announcement: NavigationConfig["announcement"] }) {
  if (!announcement.enabled || !announcement.message) return null;

  return (
    <div className="bg-accent text-accent-foreground">
      <p className="container-site type-small flex min-h-10 flex-wrap items-center justify-center gap-x-3 py-2 text-center font-medium">
        <span>{announcement.message}</span>
        {announcement.link ? (
          <SiteLink
            href={announcement.link.href}
            external={announcement.link.external}
            className="inline-flex min-h-8 items-center underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {announcement.link.label}
          </SiteLink>
        ) : null}
      </p>
    </div>
  );
}
