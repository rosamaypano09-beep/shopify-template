import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { isExternalUrl } from "@/lib/utils";

interface SiteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Force a new tab. External URLs always open safely either way. */
  external?: boolean;
  children: ReactNode;
}

/** Internal links use the Next.js router; external ones become plain anchors. */
export function SiteLink({ href, external, children, ...props }: SiteLinkProps) {
  if (external || isExternalUrl(href)) {
    const newTab = external || /^(https?:)?\/\//.test(href);
    return (
      <a href={href} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
