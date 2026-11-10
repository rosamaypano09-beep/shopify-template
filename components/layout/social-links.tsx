import type { SocialNetwork, StoreConfig } from "@/config";

const labels: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  x: "X",
};

/** Text links, in the order the client listed them. Networks without a URL are skipped. */
export function SocialLinks({ social, className }: { social: StoreConfig["social"]; className?: string }) {
  const entries = (Object.entries(social) as [SocialNetwork, string | undefined][]).filter(
    (entry): entry is [SocialNetwork, string] => Boolean(entry[1]),
  );
  if (!entries.length) return null;

  return (
    <ul className={className}>
      {entries.map(([network, url]) => (
        <li key={network}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
          >
            {labels[network]}
          </a>
        </li>
      ))}
    </ul>
  );
}
