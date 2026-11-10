import { NextResponse, type NextRequest } from "next/server";
import { isDashboardEnabled, passwordRequired, sessionSecret } from "@/lib/dashboard/access";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/dashboard/session-core";

/**
 * Runs before any /dashboard page is rendered.
 *  - Dashboard not set up for this environment: "page not found".
 *  - Not signed in: sent to the sign-in page. Nothing of the dashboard is rendered.
 */
export function proxy(request: NextRequest) {
  if (!isDashboardEnabled()) {
    return NextResponse.rewrite(new URL("/page-not-found", request.url), { status: 404 });
  }
  if (!passwordRequired() || request.nextUrl.pathname === "/dashboard/login") return NextResponse.next();

  if (verifySessionValue(request.cookies.get(SESSION_COOKIE)?.value, sessionSecret())) return NextResponse.next();
  return NextResponse.redirect(new URL("/dashboard/login", request.url));
}

export const config = { matcher: ["/dashboard", "/dashboard/:path*"] };
