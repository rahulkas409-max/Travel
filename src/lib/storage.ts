/**
 * Tiny, typed LocalStorage layer. Every key is namespaced + versioned so a
 * future schema change can migrate cleanly. All access is try/catch guarded
 * (private mode, quota errors, disabled storage).
 */

const NS = "roamindia:v1:";

export const STORAGE_KEYS = {
  trip: "trip",
  savedStays: "saved-stays",
  rouletteWins: "roulette-wins",
  muted: "muted",
  theme: "theme",
  savedTrips: "saved-trips",
  pro: "pro",
  proBranding: "pro-branding",
  proCosts: "pro-costs",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function readJSON<T>(key: StorageKey, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(NS + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* quota / private mode — state still lives in memory */
  }
}

export function removeKey(key: StorageKey): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NS + key);
  } catch {
    /* ignore */
  }
}

/** Wipe everything RoamIndia stored on this device. */
export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("roamindia:"))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
