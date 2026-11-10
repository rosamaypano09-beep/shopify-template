import "server-only";
import { logger } from "@/lib/logger";

/**
 * Where form submissions go. The engine does not hardcode an email provider:
 * each form posts JSON to a webhook URL, which can be Klaviyo, Mailchimp,
 * Zapier, Make, a Google Apps Script, or the client's own endpoint.
 *
 *   NEWSLETTER_WEBHOOK_URL   receives { type: "newsletter", email, source }
 *   CONTACT_WEBHOOK_URL      receives { type: "contact", name, email, message, source }
 */
export type FormKind = "newsletter" | "contact";

const ENV: Record<FormKind, string> = {
  newsletter: "NEWSLETTER_WEBHOOK_URL",
  contact: "CONTACT_WEBHOOK_URL",
};

function webhookUrl(kind: FormKind): string | null {
  const value = process.env[ENV[kind]]?.trim();
  return value && /^https:\/\//.test(value) ? value : null;
}

/**
 * "webhook" when a destination is configured. "log" only during development,
 * so forms can be tried locally (submissions print in the terminal).
 * "off" in production without a webhook: the form is not shown at all,
 * because a form that silently drops messages is worse than no form.
 */
export function formMode(kind: FormKind): "webhook" | "log" | "off" {
  if (webhookUrl(kind)) return "webhook";
  return process.env.NODE_ENV === "production" ? "off" : "log";
}

export async function deliver(kind: FormKind, payload: Record<string, string>): Promise<boolean> {
  const url = webhookUrl(kind);
  if (!url) {
    if (formMode(kind) === "off") return false;
    logger.info("Form submission (development only, not sent anywhere)", { scope: "forms", kind });
    return true;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: kind, ...payload }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      logger.error("Form webhook rejected the submission", { scope: "forms", kind, status: response.status });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Form webhook could not be reached", { scope: "forms", kind, error });
    return false;
  }
}
