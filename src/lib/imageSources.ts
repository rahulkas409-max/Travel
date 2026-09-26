/**
 * Turns app entities (destinations, activities, dishes, stays) into open-image
 * lookups, and resolves them: Wikipedia lead photo → Wikimedia Commons search
 * → curated Unsplash photo → generated postcard (handled by <SmartImage/>).
 */

import { GEO } from "@data/geo";
import type { Activity, ActivityKind, Destination, Dish, Property } from "@data/types";
import { hashString } from "./format";
import { getImage, themeFor, type ResolvedImage } from "./images";
import { getWikiSummary, peekCache, searchCommons, type OpenImage } from "./openData";

export interface ImageSource {
  /** Wikipedia article whose lead photo is preferred. */
  wiki?: string;
  /** Commons search queries, tried in order until one returns photos. */
  queries?: string[];
  /** Curated theme key used when no open image is found. */
  fallbackKey: string;
  label: string;
  /** Picks a stable variant among several search results. */
  seed?: string | number;
}

/* ─────────────────────────── Builders ─────────────────────────── */

const KIND_WORD: Record<ActivityKind, string> = {
  heritage: "architecture",
  nature: "landscape",
  adventure: "trek",
  food: "food",
  nightlife: "night",
  wellness: "resort",
  learning: "museum",
  team: "resort",
  spiritual: "temple",
  shopping: "market",
  beach: "beach",
  romance: "sunset",
};

/** Words that start many activity names but aren't place names. */
const GENERIC = new Set(
  (
    "Sunrise Sunset Evening Morning Dawn Night Private Slow Guided Team Heritage Group Street Candlelit Rooftop Couples Blanket Strategy " +
    "Regional Barbecue Karaoke Agro Science Naturalist Campfire Telescope Scooty Hostel Open Watersports Spice Beach Offsite Silent Turtle " +
    "Kayak Ayurvedic Cliff Village Craft Craft Full White Snow Paragliding Acclimatise Walk Coffee Tea Plantation Estate Bonfire Live " +
    "Houseboat Artisan Golden Easy Free Siesta Tractor Organic Five Dhaba Chappan Food Jungle Afternoon Dawn Dharavi Weekly Marble " +
    "Walk Sunday Boat Shikara Train Toy Local Wooden Apple Himachali Homemade Pine Cycle Treehouse Kodava Seafood Konkani Khasi Wazwan " +
    "Ladakhi Kerala Assamese Chhattisgarhi Litti Dhuska Bedai Khoya Jigarthanda Amritsari Old Visit Hands Farm Estate Group Tempo Rain " +
    "Spa Mini Mud Salt Red High Wildlife Dokra Gond Satra Samaguri Bamboo Paddy Pepper Mango"
  ).split(" "),
);
const STOP = new Set("The A An And Of At In On To From For With By Day".split(" "));

/** First run of place-like capitalised words, e.g. "Chapora Fort", "Hawa Mahal". */
export function placePhrase(name: string): string | null {
  const head = name.split(/\s[—:–-]\s/)[0];
  const words = head.replace(/[&(),'’/]/g, " ").split(/\s+/).filter(Boolean);
  let run: string[] = [];
  const runs: string[][] = [];
  words.forEach((w, i) => {
    const cap = /^[A-Z][a-zA-Z.]+$/.test(w) && !STOP.has(w);
    const generic = GENERIC.has(w);
    if (cap && !(i === 0 && generic)) run.push(w);
    else {
      if (run.length) runs.push(run);
      run = [];
    }
  });
  if (run.length) runs.push(run);
  const best = runs.map((r) => r.filter((w) => !GENERIC.has(w) || r.length > 1)).find((r) => r.length > 0);
  return best ? best.slice(0, 3).join(" ") : null;
}

const shortName = (d: Destination) => d.name.split(/[ &(]/)[0];

export function destinationSource(d: Destination, seed: string | number = 0): ImageSource {
  return {
    wiki: seed === 0 ? GEO[d.id]?.wiki : undefined,
    queries: [GEO[d.id]?.wiki ?? d.name, `${d.name} ${d.state.split(" ")[0]}`, d.name],
    fallbackKey: d.imageKey,
    label: d.name,
    seed: `${d.id}:${seed}`,
  };
}

export function activitySource(a: Activity, d: Destination): ImageSource {
  const place = a.generic ? null : placePhrase(a.name);
  const dn = shortName(d);
  const queries: string[] = [];
  if (place) {
    if (!place.toLowerCase().includes(dn.toLowerCase())) queries.push(`${place} ${dn}`);
    queries.push(place);
  }
  queries.push(`${GEO[d.id]?.wiki ?? d.name} ${KIND_WORD[a.kind]}`, `${d.name} ${KIND_WORD[a.kind]}`, GEO[d.id]?.wiki ?? d.name);
  return { queries, fallbackKey: `kind-${a.kind}`, label: a.name, seed: a.id };
}

export function dishSource(dish: Dish): ImageSource {
  const clean = dish.name.replace(/[&]/g, " ").replace(/\s+/g, " ").trim();
  return {
    queries: [clean, ...(dish.localName ? [dish.localName] : []), `${clean.split(" ").slice(-1)[0]} Indian food`],
    fallbackKey: "food",
    label: dish.name,
    seed: dish.id,
  };
}

/** First photo of a stay = its neighbourhood; the rest stay curated room/pool shots. */
export function propertySource(p: Property, index: number, d: Destination | undefined): ImageSource {
  if (index === 0 && d) {
    const hood = placePhrase(p.neighbourhood) ?? p.neighbourhood.split(/[,(]/)[0];
    return {
      queries: [`${hood} ${shortName(d)}`, GEO[d.id]?.wiki ?? d.name],
      fallbackKey: p.imageKeys[0],
      label: p.name,
      seed: `${p.id}-0`,
    };
  }
  return { fallbackKey: p.imageKeys[index] ?? p.imageKeys[0], label: p.name, seed: `${p.id}-${index}` };
}

export function keySource(key: string, label: string, seed: string | number = 0, queries?: string[]): ImageSource {
  return { fallbackKey: key, label, seed, queries };
}

/* ─────────────────────────── Resolution ─────────────────────────── */

export function sourceKey(s: ImageSource): string {
  return `img:${hashString(JSON.stringify([s.wiki, s.queries, s.fallbackKey, s.seed]))}`;
}

export function openToResolved(open: OpenImage, s: ImageSource): ResolvedImage {
  return {
    key: s.fallbackKey,
    id: open.file ?? open.thumb,
    family: themeFor(s.fallbackKey).family,
    label: s.label,
    src: open.thumb,
    hiRes: open.full,
    wallpaper: open.full,
    credit: open.author ? `${open.author} · ${open.license ?? "CC"} via ${open.provider}` : `Photo via ${open.provider}`,
    provider: open.provider,
    sourceUrl: open.sourceUrl,
    file: open.file,
    license: open.license,
    author: open.author,
    open: true,
  };
}

export function curatedFallback(s: ImageSource, width = 900): ResolvedImage {
  return getImage(s.fallbackKey, s.label, s.seed ?? 0, width);
}

const memo = new Map<string, OpenImage | null>();

/** Synchronous lookup of an already-resolved open image (memory → LocalStorage). */
export function peekOpen(s: ImageSource): OpenImage | null | undefined {
  const key = sourceKey(s);
  if (memo.has(key)) return memo.get(key);
  const cached = peekCache<OpenImage | "none">(key);
  if (cached === undefined) return undefined;
  const v = cached === "none" ? null : cached;
  memo.set(key, v);
  return v;
}

function remember(s: ImageSource, v: OpenImage | null) {
  const key = sourceKey(s);
  memo.set(key, v);
  try {
    const exp = Date.now() + (v ? 3 : 1) * 24 * 60 * 60 * 1000;
    localStorage.setItem(`roamindia:v1:open:${key}`, JSON.stringify({ v: v ?? "none", exp }));
  } catch {
    /* ignore */
  }
}

const pending = new Map<string, Promise<OpenImage | null>>();

/** Resolve an open-licensed image for a source; null when nothing suitable exists (or offline). */
export function resolveOpen(s: ImageSource): Promise<OpenImage | null> {
  const known = peekOpen(s);
  if (known !== undefined) return Promise.resolve(known);
  if (!s.wiki && !s.queries?.length) return Promise.resolve(null);
  const key = sourceKey(s);
  const hit = pending.get(key);
  if (hit) return hit;
  const p = (async () => {
    let reachedNetwork = false;
    if (s.wiki) {
      const sum = await getWikiSummary(s.wiki);
      if (sum) reachedNetwork = true;
      if (sum?.image && sum.image.width >= 640) {
        remember(s, sum.image);
        return sum.image;
      }
    }
    for (const q of s.queries ?? []) {
      const results = await searchCommons(q);
      if (results.length) {
        const pickFrom = Math.min(results.length, 6);
        const img = results[hashString(String(s.seed ?? 0)) % pickFrom];
        remember(s, img);
        return img;
      }
    }
    // Only remember a miss when the API actually answered (don't cache offline failures).
    if (reachedNetwork) remember(s, null);
    return null;
  })().finally(() => pending.delete(key));
  pending.set(key, p);
  return p;
}
