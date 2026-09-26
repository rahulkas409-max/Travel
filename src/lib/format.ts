/** Formatting helpers shared by UI, PDF and WhatsApp exports. */

const inrFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export const inr = (n: number) => `₹${inrFormatter.format(Math.round(n))}`;

export const inrRange = ([a, b]: [number, number]) => `${inr(a)} – ${inr(b)}`;

/** 510 → "8:30 AM" */
export function clock(mins: number): string {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mm.toString().padStart(2, "0")} ${suffix}`;
}

/** 135 → "2h 15m" */
export function duration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function dayDate(startISO: string | undefined, dayIndex: number): string | null {
  if (!startISO) return null;
  const d = new Date(`${startISO}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Small deterministic PRNG (mulberry32) so plans are reproducible per seed. */
export function seededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
