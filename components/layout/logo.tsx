import Image from "next/image";
import Link from "next/link";
import type { LogoConfig } from "@/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  logo: LogoConfig;
  storeName: string;
  className?: string;
}

export function Logo({ logo, storeName, className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${storeName} home`}
      className={cn("inline-flex min-h-11 shrink-0 items-center", className)}
    >
      {logo.type === "image" ? (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          unoptimized={logo.src.endsWith(".svg")}
          className="h-8 w-auto"
        />
      ) : (
        <span className="font-heading text-[1.375rem] leading-none font-(--ce-heading-weight) tracking-(--ce-heading-tracking)">
          {logo.text || storeName}
        </span>
      )}
    </Link>
  );
}
