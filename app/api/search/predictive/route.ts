import { NextResponse, type NextRequest } from "next/server";
import { getSiteConfig } from "@/config";
import { logger } from "@/lib/logger";
import { cleanQuery, predictiveSearch } from "@/lib/shopify";

/**
 * Search-as-you-type results for the header search box.
 * GET /api/search/predictive?q=sho
 */
export async function GET(request: NextRequest) {
  if (!getSiteConfig().features.predictiveSearch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query = cleanQuery(request.nextUrl.searchParams.get("q") ?? "");
  if (query.length < 2) {
    return NextResponse.json({ products: [], collections: [], suggestions: [] });
  }

  try {
    const result = await predictiveSearch(query.toLowerCase());
    return NextResponse.json(result, {
      // Search results are the same for every visitor, so the CDN may keep them briefly.
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    logger.error("Predictive search failed", { scope: "search", error });
    return NextResponse.json({ error: "Search is unavailable right now." }, { status: 503 });
  }
}
