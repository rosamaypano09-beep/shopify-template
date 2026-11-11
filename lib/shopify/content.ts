import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getCatalogSource } from "./source";
import type { Article, Blog, BlogOptions, ContentIndex, ShopMenuItem, ShopPage } from "./types";

/**
 * Content written in Shopify admin: blog posts (Online Store > Blog posts),
 * pages (Online Store > Pages) and menus (Online Store > Navigation).
 * Cached for minutes, like the catalog, so a new post appears soon after it
 * is published. The dashboard's "Refresh from Shopify" clears it at once.
 */

export async function getBlog(handle: string, options: BlogOptions = {}): Promise<Blog | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content", `blog:${handle}`);
  return getCatalogSource().getBlog(handle, options);
}

export async function getArticle(blogHandle: string, articleHandle: string): Promise<Article | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content", `blog:${blogHandle}`, `article:${blogHandle}/${articleHandle}`);
  return getCatalogSource().getArticle(blogHandle, articleHandle);
}

export async function getPage(handle: string): Promise<ShopPage | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content", `page:${handle}`);
  return getCatalogSource().getPage(handle);
}

/** A rough reading time, in minutes, from the article's HTML. */
export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function getMenu(handle: string): Promise<ShopMenuItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content", `menu:${handle}`);
  return getCatalogSource().getMenu(handle);
}

export async function listContent(): Promise<ContentIndex> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content");
  return getCatalogSource().listContent();
}
