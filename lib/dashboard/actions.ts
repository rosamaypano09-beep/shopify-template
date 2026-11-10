"use server";

import { logger } from "@/lib/logger";
import { setPath } from "@/lib/merge";
import { isAuthorized } from "./session";
import { readOverrides, writeOverrides } from "./store";
import { editablePaths } from "./schema";

export type SaveResult = { ok: true; note: string } | { ok: false; error: string; errors?: Record<string, string> };

/**
 * Saves dashboard edits to config/site.json.
 * `changes` maps a setting path to its new value; `null` resets that setting
 * to the default written in the *.config.ts files.
 */
export async function saveSettingsAction(changes: Record<string, unknown>): Promise<SaveResult> {
  if (!(await isAuthorized())) return { ok: false, error: "Your session has ended. Sign in again." };

  const errors: Record<string, string> = {};
  let next = await readOverrides();

  for (const [key, raw] of Object.entries(changes)) {
    const schema = editablePaths[key];
    if (!schema) {
      errors[key] = "This setting cannot be changed from the dashboard.";
      continue;
    }
    if (raw === null) {
      next = setPath(next, key, undefined);
      continue;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors[key] = issue.path.length ? `${issue.path.join(" > ")}: ${issue.message}` : issue.message;
      continue;
    }
    next = setPath(next, key, parsed.data);
  }

  if (Object.keys(errors).length) return { ok: false, error: "Some values need fixing. Nothing was saved.", errors };

  try {
    return { ok: true, note: await writeOverrides(next) };
  } catch (error) {
    logger.error("Could not save dashboard settings", { scope: "dashboard", error });
    return { ok: false, error: "The settings could not be saved. Check the server log for the reason." };
  }
}
