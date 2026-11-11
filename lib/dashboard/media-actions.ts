"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { logger } from "@/lib/logger";
import { isAuthorized } from "./session";
import { writeNewProjectFile } from "./store";

/** Image files the dashboard can show, pick and upload. Kept in /public so the storefront serves them as they are. */

const PUBLIC_DIR = "public";
const UPLOAD_DIR = "uploads";
const LISTED = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_LISTED = 400;
// SVG is listed (the project's own files) but not accepted as an upload: it can carry scripts.
const UPLOAD_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export type MediaListResult = { ok: true; images: string[] } | { ok: false; error: string };
export type UploadResult = { ok: true; src: string; note: string } | { ok: false; error: string };

async function walk(dir: string, prefix: string, out: string[]) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (out.length >= MAX_LISTED || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    const url = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await walk(full, url, out);
    else if (LISTED.test(entry.name)) out.push(url);
  }
}

/** Every image under /public, newest uploads first. */
export async function listImagesAction(): Promise<MediaListResult> {
  if (!(await isAuthorized())) return { ok: false, error: "Your session has ended. Sign in again." };
  const images: string[] = [];
  await walk(path.join(process.cwd(), PUBLIC_DIR), "", images);
  const uploads = images.filter((src) => src.startsWith(`/${UPLOAD_DIR}/`)).sort().reverse();
  const rest = images.filter((src) => !src.startsWith(`/${UPLOAD_DIR}/`)).sort();
  return { ok: true, images: [...uploads, ...rest] };
}

/** Checks the file's first bytes, so a renamed non-image is refused whatever the browser claims. */
function looksLike(extension: string, bytes: Buffer): boolean {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");
  switch (extension) {
    case "png":
      return bytes.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    case "jpg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "gif":
      return ascii(0, 4) === "GIF8";
    case "webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "avif":
      return ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12));
    default:
      return false;
  }
}

function safeBaseName(name: string): string {
  const base = name.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base.slice(0, 60) || "image";
}

/** Saves an uploaded image to /public/uploads and returns the path to use in a section. */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  if (!(await isAuthorized())) return { ok: false, error: "Your session has ended. Sign in again." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image to upload." };
  const extension = UPLOAD_TYPES[file.type];
  if (!extension) return { ok: false, error: "Use a PNG, JPG, WebP, AVIF or GIF image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Images can be up to 4 MB. Export a smaller copy and try again." };

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLike(extension, bytes)) return { ok: false, error: "That file does not look like the image type it claims to be." };

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const name = `${safeBaseName(file.name)}-${stamp}-${Math.random().toString(36).slice(2, 7)}.${extension}`;
  const relative = `${PUBLIC_DIR}/${UPLOAD_DIR}/${name}`;
  try {
    const note = await writeNewProjectFile(relative, bytes);
    return { ok: true, src: `/${UPLOAD_DIR}/${name}`, note };
  } catch (error) {
    logger.error("Image upload failed", { scope: "dashboard", error });
    return { ok: false, error: "The image could not be saved. Check the server log for the reason." };
  }
}
