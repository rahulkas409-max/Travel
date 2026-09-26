import type { Destination } from "./types";

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  /** Tailwind gradient for the tile. */
  gradient: string;
  /** Commons search for the tile photo. */
  photo: string;
  match: (d: Destination) => boolean;
}

export const COLLECTIONS: Collection[] = [
  { id: "farmhouses", title: "Farmhouses near metros", subtitle: "Pool farms, agro-stays & estates", emoji: "🌾", gradient: "from-sage-500 to-emerald-700", photo: "farmhouse India countryside", match: (d) => !!d.farmhouseHub },
  { id: "snow", title: "Snow & high passes", subtitle: "Himalayan escapes", emoji: "🏔️", gradient: "from-sky-500 to-indigo-700", photo: "Himalaya snow Himachal", match: (d) => d.landscapes[0] === "mountains" && d.elevation >= 1800 },
  { id: "beaches", title: "Beaches & coves", subtitle: "Goa to Gokarna & beyond", emoji: "🏖️", gradient: "from-marigold-400 to-rose-500", photo: "Palolem beach", match: (d) => d.landscapes.includes("beaches") },
  { id: "heritage", title: "Forts, palaces & havelis", subtitle: "Royal India", emoji: "🏰", gradient: "from-rose-500 to-marigold-600", photo: "Mehrangarh fort", match: (d) => d.landscapes[0] === "palaces" },
  { id: "estates", title: "Tea & coffee estates", subtitle: "Plantation bungalow stays", emoji: "🍵", gradient: "from-emerald-500 to-sage-700", photo: "Munnar tea plantation", match: (d) => d.tags.some((t) => /tea|coffee/i.test(t)) },
  { id: "offsites", title: "Offsite-ready", subtitle: "Lawns, halls & fast Wi-Fi", emoji: "💼", gradient: "from-slate-600 to-slate-900", photo: "resort lawn India", match: (d) => d.occasions.includes("corporate") && (d.farmhouseHub || d.tier <= 2) },
  { id: "school", title: "School trips & camps", subtitle: "Safe, hands-on learning", emoji: "🎒", gradient: "from-marigold-500 to-sage-600", photo: "Jantar Mantar Jaipur", match: (d) => d.occasions.includes("school") },
  { id: "romantic", title: "Honeymoon picks", subtitle: "Sunsets & private stays", emoji: "💞", gradient: "from-rose-400 to-rose-700", photo: "Lake Pichola sunset", match: (d) => d.occasions.includes("romantic") && d.tier >= 2 },
  { id: "offbeat", title: "Off-beat Tier 3", subtitle: "Before the crowds arrive", emoji: "🧭", gradient: "from-sage-600 to-slate-800", photo: "Ziro valley", match: (d) => d.tier === 3 },
  { id: "wildlife", title: "Jungles & waterfalls", subtitle: "Tigers, mist & monsoon", emoji: "🐅", gradient: "from-emerald-600 to-slate-900", photo: "Kanha tiger", match: (d) => d.landscapes[0] === "forests" },
];

export const COLLECTION_BY_ID = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c]));

/** Indicative "from" price per person per day. */
export function fromPrice(d: Destination): number {
  if (d.budgets.includes("backpacker")) return d.tier === 1 ? 1800 : 1200;
  if (d.budgets.includes("boutique")) return 2500;
  return 6000;
}

/** Trending order for the home carousel (curated, seasonally sensible). */
export const TRENDING = ["north-goa", "munnar", "udaipur", "leh-ladakh", "coorg", "jaipur", "varanasi", "shillong", "darjeeling", "hampi", "pune", "jibhi", "kochi", "rann-of-kutch"];
