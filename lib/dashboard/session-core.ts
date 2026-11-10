import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Login-cookie signing, kept free of framework imports so the request proxy can use it too. */

export const SESSION_COOKIE = "ce_admin";
export const SESSION_SECONDS = 60 * 60 * 12;

const sign = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");

/** Compares without leaking, through timing, how much of the value matched. */
export function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function createSessionValue(secret: string, now = Date.now()): string {
  const expires = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expires}.${sign(expires, secret)}`;
}

export function verifySessionValue(value: string | undefined, secret: string | null, now = Date.now()): boolean {
  if (!value || !secret) return false;
  const [expires, signature, extra] = value.split(".");
  if (!expires || !signature || extra !== undefined) return false;
  if (!safeEqual(signature, sign(expires, secret))) return false;
  return Number(expires) > now / 1000;
}
