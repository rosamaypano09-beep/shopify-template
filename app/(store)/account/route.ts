import { NextResponse } from "next/server";
import { getSiteConfig } from "@/config";
import { getAccountUrl } from "@/lib/env";

/**
 * /account sends customers to Shopify's hosted account pages, where they sign
 * in with a one-time code and see their orders, addresses and profile.
 * Shopify runs those pages, so no customer password or token touches this site.
 */
export function GET() {
  const url = getSiteConfig().features.customerAccounts ? getAccountUrl() : null;
  if (!url) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(url, 302);
}
