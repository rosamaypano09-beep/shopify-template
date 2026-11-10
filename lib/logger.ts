type Level = "info" | "warn" | "error";

export interface LogContext {
  /** Where it happened, e.g. "shopify", "config", "checkout". */
  scope: string;
  [key: string]: unknown;
}

const SENSITIVE = /token|secret|password|authorization|cookie|email|phone/i;

function redact(context: LogContext): LogContext {
  const safe: LogContext = { scope: context.scope };
  for (const [key, value] of Object.entries(context)) {
    if (key === "scope") continue;
    safe[key] = SENSITIVE.test(key) ? "[redacted]" : value;
  }
  return safe;
}

function write(level: Level, message: string, context: LogContext) {
  const entry = { level, message, ...redact(context) };
  // One JSON line per event: readable in Vercel logs and easy to ship elsewhere.
  console[level](JSON.stringify(entry));
}

/**
 * Server-side logging. To add Sentry or another monitor later, forward
 * `error` calls from here; nothing else in the app needs to change.
 */
export const logger = {
  info: (message: string, context: LogContext) => write("info", message, context),
  warn: (message: string, context: LogContext) => write("warn", message, context),
  error: (message: string, context: LogContext & { error?: unknown }) => {
    const { error, ...rest } = context;
    write("error", message, {
      ...rest,
      ...(error instanceof Error ? { errorName: error.name, errorMessage: error.message } : {}),
    });
  },
};
