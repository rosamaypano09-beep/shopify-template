import type { Metadata } from "next";
import { getSiteConfig } from "@/config";
import { SectionRenderer } from "@/components/sections/section-renderer";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return <SectionRenderer sections={getSiteConfig().homepage.sections} />;
}
