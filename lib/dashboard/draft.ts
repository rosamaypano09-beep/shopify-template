import "server-only";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SectionConfig } from "@/config/types";

/**
 * Unsaved homepage edits, kept only so the editor's live preview can render
 * them. Stored in the server's temporary folder, never in config/site.json.
 * On a host with several server instances a preview can occasionally miss its
 * draft; the editor then shows the last version it could render.
 */
const DIR = path.join(os.tmpdir(), "ce-homepage-drafts");
const ID = /^[a-z0-9-]{8,64}$/;

export function isDraftId(id: unknown): id is string {
  return typeof id === "string" && ID.test(id);
}

export async function writeDraft(id: string, sections: SectionConfig[]): Promise<void> {
  if (!isDraftId(id)) throw new Error("Invalid draft id.");
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, `${id}.json`), JSON.stringify(sections), "utf8");
}

export async function readDraft(id: string): Promise<SectionConfig[] | null> {
  if (!isDraftId(id)) return null;
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${id}.json`), "utf8")) as SectionConfig[];
  } catch {
    return null;
  }
}
