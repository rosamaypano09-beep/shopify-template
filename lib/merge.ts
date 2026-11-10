/** Deep merge for plain config objects. Arrays and primitives in `overrides` replace the base value. */
export function deepMerge<T>(base: T, overrides: unknown): T {
  if (overrides === undefined || overrides === null) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base)) return overrides as T;
  if (typeof overrides !== "object" || Array.isArray(overrides)) return overrides as T;
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides as Record<string, unknown>)) {
    if (value === undefined) continue;
    result[key] = deepMerge(result[key], value);
  }
  return result as T;
}

export function getPath(source: unknown, path: string): unknown {
  let current = source;
  for (const key of path.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** Returns a copy of `target` with `path` set. `undefined` removes the key (and any parents left empty). */
export function setPath<T extends Record<string, unknown>>(target: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const copy = { ...target } as Record<string, unknown>;
  if (!rest.length) {
    if (value === undefined) delete copy[head];
    else copy[head] = value;
    return copy as T;
  }
  const child = typeof copy[head] === "object" && copy[head] !== null && !Array.isArray(copy[head]) ? copy[head] : {};
  const next = setPath(child as Record<string, unknown>, rest.join("."), value);
  if (Object.keys(next).length) copy[head] = next;
  else delete copy[head];
  return copy as T;
}
