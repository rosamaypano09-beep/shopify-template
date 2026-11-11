"use server";

import type { SectionConfig } from "@/config/types";
import { logger } from "@/lib/logger";
import { writeDraft } from "./draft";
import { editablePaths } from "./schema";
import { isAuthorized } from "./session";

export type DraftResult = { ok: true } | { ok: false; error: string };

/** Stores unsaved homepage sections for the live preview. Checked exactly like a save, but nothing is published. */
export async function saveHomepageDraftAction(id: string, sections: unknown): Promise<DraftResult> {
  if (!(await isAuthorized())) return { ok: false, error: "Your session has ended. Sign in again." };
  const parsed = editablePaths["homepage.sections"].safeParse(sections);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.path.length ? `${issue.path.join(" > ")}: ${issue.message}` : issue.message };
  }
  try {
    await writeDraft(id, parsed.data as SectionConfig[]);
    return { ok: true };
  } catch (error) {
    logger.error("Could not store homepage draft", { scope: "dashboard", error });
    return { ok: false, error: "The preview could not be updated." };
  }
}
