import "server-only";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { dashboardPassword, isDashboardEnabled, passwordRequired, sessionSecret } from "./access";
import { createSessionValue, safeEqual, SESSION_COOKIE, SESSION_SECONDS, verifySessionValue } from "./session-core";

export function checkPassword(attempt: string): boolean {
  const password = dashboardPassword();
  return Boolean(password) && safeEqual(attempt, password as string);
}

export async function startSession() {
  const secret = sessionSecret();
  if (!secret) return;
  (await cookies()).set(SESSION_COOKIE, createSessionValue(secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/dashboard",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/dashboard", maxAge: 0 });
}

/** Whether this request may use the dashboard. */
export async function isAuthorized(): Promise<boolean> {
  if (!isDashboardEnabled()) return false;
  if (!passwordRequired()) return true;
  // The login check depends on the current time, so it always runs per request, never ahead of time.
  await connection();
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value, sessionSecret());
}

/**
 * Call at the top of every dashboard page and data function. The request
 * proxy (proxy.ts) already turns signed-out visitors away; this is the second
 * lock, so a page can never render for someone who is not signed in.
 */
export async function assertAdmin(): Promise<void> {
  if (!(await isAuthorized())) notFound();
}
