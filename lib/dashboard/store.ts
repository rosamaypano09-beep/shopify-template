import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { githubTarget, storageKind } from "./access";

/** Reads and writes the saved dashboard settings (config/site.json), wherever they live. */

type Overrides = Record<string, unknown>;
const FILE_PATH = "config/site.json";

const asObject = (value: unknown): Overrides =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Overrides) : {};

async function github(method: "GET" | "PUT", body?: unknown) {
  const target = githubTarget();
  if (!target) throw new Error("GitHub is not configured.");
  const url = `https://api.github.com/repos/${target.repo}/contents/${FILE_PATH}${method === "GET" ? `?ref=${encodeURIComponent(target.branch)}` : ""}`;
  return fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${target.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
}

async function readGithub(): Promise<{ overrides: Overrides; sha?: string }> {
  const response = await github("GET");
  if (response.status === 404) return { overrides: {} };
  if (!response.ok) throw new Error(`GitHub responded with ${response.status} while reading settings.`);
  const file = (await response.json()) as { content?: string; sha?: string };
  try {
    return { overrides: asObject(JSON.parse(Buffer.from(file.content ?? "", "base64").toString("utf8"))), sha: file.sha };
  } catch {
    return { overrides: {}, sha: file.sha };
  }
}

export async function readOverrides(): Promise<Overrides> {
  if (storageKind() === "github") return (await readGithub()).overrides;
  try {
    return asObject(JSON.parse(await fs.readFile(path.join(process.cwd(), FILE_PATH), "utf8")));
  } catch {
    return {};
  }
}

/** Returns a short note for the person saving, describing when the change goes live. */
export async function writeOverrides(next: Overrides): Promise<string> {
  const text = `${JSON.stringify(next, null, 2)}\n`;
  if (storageKind() === "github") {
    const target = githubTarget();
    const { sha } = await readGithub();
    const response = await github("PUT", {
      message: "Update store settings from the dashboard",
      content: Buffer.from(text, "utf8").toString("base64"),
      branch: target?.branch,
      sha,
    });
    if (!response.ok) throw new Error(`GitHub responded with ${response.status} while saving settings.`);
    return "Saved. The live site updates in about a minute, once it has redeployed.";
  }
  await fs.writeFile(path.join(process.cwd(), FILE_PATH), text, "utf8");
  return "Saved. The store preview updates in a moment.";
}
