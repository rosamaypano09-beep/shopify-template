import "server-only";
import { buildSiteConfig, type SiteConfig } from "@/config";
import { getPath } from "@/lib/merge";
import { assertAdmin } from "./session";
import { readOverrides } from "./store";

/** The configuration as last saved from the dashboard (which on a live site may be a minute ahead of the deployed one). */
export async function getDashboardConfig(): Promise<SiteConfig> {
  await assertAdmin();
  return buildSiteConfig(await readOverrides());
}

/** Current value of each setting path, for filling in a dashboard form. */
export async function currentValues(paths: string[]): Promise<Record<string, unknown>> {
  const config = await getDashboardConfig();
  const source = {
    ...config,
    theme: { preset: config.theme.id, tokens: config.theme.tokens, variants: config.theme.variants },
  };
  return Object.fromEntries(paths.map((path) => [path, getPath(source, path) ?? undefined]));
}
