"use server";

import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { isDashboardEnabled } from "./access";
import { checkPassword, endSession, startSession } from "./session";

export async function loginAction(_previous: { error: string }, form: FormData): Promise<{ error: string }> {
  if (!isDashboardEnabled()) return { error: "The dashboard is not set up on this site." };
  const attempt = String(form.get("password") ?? "");
  if (!checkPassword(attempt)) {
    // Slows down guessing. For stronger protection, add a rate limit at the host's firewall.
    await new Promise((resolve) => setTimeout(resolve, 900));
    logger.warn("Failed dashboard sign-in", { scope: "dashboard" });
    return { error: "That password is not correct." };
  }
  await startSession();
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/dashboard/login");
}
