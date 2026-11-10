/**
 * Where the Store Builder runs and how it is protected.
 *
 * On your computer (`npm run dev`): always available. Edits are written to
 * config/site.json. A password is asked for only if DASHBOARD_PASSWORD is set.
 *
 * On the live site: available only when ALL of these are set, otherwise every
 * /dashboard address is "page not found":
 *   DASHBOARD_PASSWORD   at least 12 characters
 *   SESSION_SECRET       at least 32 random characters (signs the login cookie)
 *   GITHUB_TOKEN         can write to the repository's contents
 *   GITHUB_REPO          "owner/name"
 * A deployed site cannot change its own files, so saving commits
 * config/site.json to GitHub and the host redeploys (about a minute).
 */

const env = (name: string) => process.env[name]?.trim() ?? "";

export function githubTarget(): { token: string; repo: string; branch: string } | null {
  const token = env("GITHUB_TOKEN");
  const repo = env("GITHUB_REPO");
  if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, branch: env("GITHUB_BRANCH") || "main" };
}

export function sessionSecret(): string | null {
  const secret = env("SESSION_SECRET");
  return secret.length >= 32 ? secret : null;
}

export function dashboardPassword(): string | null {
  const password = env("DASHBOARD_PASSWORD");
  return password.length >= 12 ? password : null;
}

/** True when a password must be entered before the dashboard opens. */
export function passwordRequired(): boolean {
  return process.env.NODE_ENV !== "development" || env("DASHBOARD_PASSWORD") !== "";
}

export function storageKind(): "file" | "github" | null {
  if (process.env.NODE_ENV === "development") return "file";
  return githubTarget() ? "github" : null;
}

export function isDashboardEnabled(): boolean {
  if (!storageKind()) return false;
  if (!passwordRequired()) return true;
  return Boolean(dashboardPassword() && sessionSecret());
}
