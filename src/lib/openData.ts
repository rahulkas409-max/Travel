/**
 * Live, open-licensed data — no API keys, CORS-enabled, community-updated:
 *
 *  • Wikipedia REST API   → destination summaries + lead photos
 *  • Wikimedia Commons API → keyword photo search (activities, dishes, stays)
 *                            + per-file author / license for attribution
 *
 * Results are cached in LocalStorage with a TTL, so photos refresh every few
 * days as Commons grows while repeat visits stay instant and polite to the API.
 * Every call fails soft (returns null / []) — callers fall back to curated
 * images or generated postcard art.
 */

import { hashString } from "./format";

export interface OpenImage {
  /** ~960px rendition for cards. */
  thumb: string;
  /** Large rendition for the viewer and downloads. */
  full: string;
  width: number;
  height: number;
  /** Commons file name (without "File:"), used to fetch author + license. */
  file: string | null;
  sourceUrl: string;
  provider: "Wikipedia" | "Wikimedia Commons";
  author?: string;
  license?: string;
}

export interface WikiSummary {
  title: string;
  description?: string;
  extract: string;
  url: string;
  image: OpenImage | null;
  coords?: { lat: number; lon: number };
}

const CACHE_NS = "roamindia:v1:open:";
const DAY = 24 * 60 * 60 * 1000;
const TTL = { summary: 5 * DAY, search: 3 * DAY, file: 30 * DAY, miss: 1 * DAY } as const;

/* ─────────────────────────── Cache ─────────────────────────── */

function cacheGet<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(CACHE_NS + key);
    if (!raw) return undefined;
    const { v, exp } = JSON.parse(raw) as { v: T; exp: number };
    if (Date.now() > exp) {
      localStorage.removeItem(CACHE_NS + key);
      return undefined;
    }
    return v;
  } catch {
    return undefined;
  }
}

function cacheSet<T>(key: string, v: T, ttl: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_NS + key, JSON.stringify({ v, exp: Date.now() + ttl }));
  } catch {
    // Quota full — drop the oldest open-data entries and move on.
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_NS))
        .slice(0, 40)
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  }
}

/** Synchronous cache peek — lets images render instantly on repeat visits. */
export function peekCache<T>(key: string): T | undefined {
  return cacheGet<T>(key);
}

/* ─────────────────────────── Polite fetching ─────────────────────────── */

const inflight = new Map<string, Promise<unknown>>();
let active = 0;
const queue: Array<() => void> = [];
const MAX_CONCURRENT = 4;

function schedule<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active++;
      task()
        .then(resolve, reject)
        .finally(() => {
          active--;
          queue.shift()?.();
        });
    };
    if (active < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

async function getJSON<T>(url: string, timeoutMs = 9000): Promise<T | null> {
  return schedule(async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  });
}

function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key) as Promise<T> | undefined;
  if (hit) return hit;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

const UPLOAD_RE = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/(?:thumb\/)?([0-9a-f])\/([0-9a-f]{2})\/([^/]+)/;

/** Build a sized thumbnail URL for an upload.wikimedia.org original. */
export function wikimediaThumb(original: string, width: number): string {
  const m = original.match(UPLOAD_RE);
  if (!m) return original;
  const [, repo, a, ab, name] = m;
  const isSvg = /\.svg$/i.test(name);
  return `https://upload.wikimedia.org/wikipedia/${repo}/thumb/${a}/${ab}/${name}/${width}px-${name}${isSvg ? ".png" : ""}`;
}

function fileNameFromUrl(url: string): string | null {
  const m = url.match(UPLOAD_RE);
  return m ? decodeURIComponent(m[4]) : null;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Wikimedia now serves a fixed set of thumbnail widths; snap to the nearest. */
const WIDTHS = [330, 500, 960, 1280, 1920];
function snapWidth(w: number, original: number) {
  const target = WIDTHS.find((x) => x >= w) ?? 1920;
  return Math.min(target, original || target);
}

/* ─────────────────────────── Wikipedia summaries ─────────────────────────── */

interface RestSummary {
  title: string;
  description?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
  originalimage?: { source: string; width: number; height: number };
  thumbnail?: { source: string; width: number; height: number };
  coordinates?: { lat: number; lon: number };
  type?: string;
}

export function getWikiSummary(title: string): Promise<WikiSummary | null> {
  const key = `sum:${title}`;
  const cached = cacheGet<WikiSummary | "miss">(key);
  if (cached !== undefined) return Promise.resolve(cached === "miss" ? null : cached);
  return dedupe(key, async () => {
    const data = await getJSON<RestSummary>(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`);
    if (!data || data.type === "disambiguation" || !data.extract) {
      if (data) cacheSet(key, "miss", TTL.miss);
      return null;
    }
    const orig = data.originalimage;
    const image: OpenImage | null = orig
      ? {
          thumb: orig.width > 960 ? wikimediaThumb(orig.source, snapWidth(960, orig.width)) : orig.source,
          full: orig.width > 1920 ? wikimediaThumb(orig.source, 1920) : orig.source,
          width: orig.width,
          height: orig.height,
          file: fileNameFromUrl(orig.source),
          sourceUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          provider: "Wikipedia",
        }
      : null;
    const summary: WikiSummary = {
      title: data.title,
      description: data.description,
      extract: data.extract,
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      image,
      coords: data.coordinates,
    };
    cacheSet(key, summary, TTL.summary);
    return summary;
  });
}

/* ─────────────────────────── Commons search ─────────────────────────── */

interface CommonsResponse {
  query?: {
    pages?: Record<
      string,
      {
        title: string;
        index?: number;
        imageinfo?: Array<{
          url: string;
          thumburl?: string;
          thumbwidth?: number;
          width: number;
          height: number;
          descriptionurl: string;
          mime?: string;
          extmetadata?: Record<string, { value: string }>;
        }>;
      }
    >;
  };
}

function toOpenImage(page: NonNullable<NonNullable<CommonsResponse["query"]>["pages"]>[string]): OpenImage | null {
  const info = page.imageinfo?.[0];
  if (!info || !/image\/(jpeg|png|webp)/.test(info.mime ?? "image/jpeg")) return null;
  const meta = info.extmetadata ?? {};
  return {
    thumb: info.thumburl ?? info.url,
    full: info.width > 1920 ? wikimediaThumb(info.url, 1920) : info.url,
    width: info.width,
    height: info.height,
    file: page.title.replace(/^File:/, ""),
    sourceUrl: info.descriptionurl,
    provider: "Wikimedia Commons",
    author: meta.Artist ? stripHtml(meta.Artist.value).slice(0, 80) : undefined,
    license: meta.LicenseShortName?.value,
  };
}

/**
 * Photo search on Wikimedia Commons. Prefers large, landscape photographs
 * (skips maps, diagrams, logos, tiny scans).
 */
export function searchCommons(query: string, limit = 12): Promise<OpenImage[]> {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  const key = `cs:${hashString(q.toLowerCase())}`;
  const cached = cacheGet<OpenImage[]>(key);
  if (cached) return Promise.resolve(cached);
  return dedupe(key, async () => {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: `${q} filetype:bitmap -map -logo -diagram -flag -seal -chart`,
      gsrnamespace: "6",
      gsrlimit: String(limit),
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "960",
      iiextmetadatafilter: "Artist|LicenseShortName",
    });
    const data = await getJSON<CommonsResponse>(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!data) return []; // network failure: don't cache, retry next time
    const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const images = pages
      .map(toOpenImage)
      .filter((x): x is OpenImage => !!x)
      .filter((x) => x.width >= 800 && x.width / x.height >= 1.05 && x.width / x.height <= 2.4);
    cacheSet(key, images, images.length ? TTL.search : TTL.miss);
    return images;
  });
}

/** Author + license for a Commons file (for proper CC attribution in the viewer). */
export function getFileCredit(file: string): Promise<{ author?: string; license?: string; sourceUrl: string } | null> {
  const key = `fc:${file}`;
  const cached = cacheGet<{ author?: string; license?: string; sourceUrl: string }>(key);
  if (cached) return Promise.resolve(cached);
  return dedupe(key, async () => {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      titles: `File:${file}`,
      prop: "imageinfo",
      iiprop: "extmetadata|url",
      iiextmetadatafilter: "Artist|LicenseShortName",
    });
    const data = await getJSON<CommonsResponse>(`https://commons.wikimedia.org/w/api.php?${params}`);
    const page = Object.values(data?.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (!info) return null;
    const credit = {
      author: info.extmetadata?.Artist ? stripHtml(info.extmetadata.Artist.value).slice(0, 80) : undefined,
      license: info.extmetadata?.LicenseShortName?.value,
      sourceUrl: info.descriptionurl,
    };
    cacheSet(key, credit, TTL.file);
    return credit;
  });
}

/* ─────────────────────────── Weather (Open-Meteo) ─────────────────────────── */

export interface Forecast {
  current: { temp: number; code: number; wind: number; humidity: number; isDay: boolean };
  daily: { date: string; max: number; min: number; code: number; rainChance: number }[];
  fetchedAt: number;
}

interface OpenMeteo {
  current?: { temperature_2m: number; weather_code: number; wind_speed_10m: number; relative_humidity_2m: number; is_day: number };
  daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[]; precipitation_probability_max: number[] };
}

export function getForecast(lat: number, lon: number): Promise<Forecast | null> {
  const key = `wx:${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = cacheGet<Forecast>(key);
  if (cached) return Promise.resolve(cached);
  return dedupe(key, async () => {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,is_day",
      daily: "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
      timezone: "Asia/Kolkata",
      forecast_days: "7",
    });
    const d = await getJSON<OpenMeteo>(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!d?.current || !d.daily) return null;
    const f: Forecast = {
      current: {
        temp: Math.round(d.current.temperature_2m),
        code: d.current.weather_code,
        wind: Math.round(d.current.wind_speed_10m),
        humidity: Math.round(d.current.relative_humidity_2m),
        isDay: d.current.is_day === 1,
      },
      daily: d.daily.time.map((date, i) => ({
        date,
        max: Math.round(d.daily!.temperature_2m_max[i]),
        min: Math.round(d.daily!.temperature_2m_min[i]),
        code: d.daily!.weather_code[i],
        rainChance: d.daily!.precipitation_probability_max?.[i] ?? 0,
      })),
      fetchedAt: Date.now(),
    };
    cacheSet(key, f, 60 * 60 * 1000);
    return f;
  });
}

/** WMO weather code → emoji + label. */
export function weatherLabel(code: number, isDay = true): { emoji: string; label: string } {
  if (code === 0) return { emoji: isDay ? "☀️" : "🌙", label: "Clear" };
  if (code <= 2) return { emoji: isDay ? "🌤️" : "☁️", label: "Partly cloudy" };
  if (code === 3) return { emoji: "☁️", label: "Overcast" };
  if (code <= 48) return { emoji: "🌫️", label: "Fog" };
  if (code <= 57) return { emoji: "🌦️", label: "Drizzle" };
  if (code <= 67) return { emoji: "🌧️", label: "Rain" };
  if (code <= 77) return { emoji: "🌨️", label: "Snow" };
  if (code <= 82) return { emoji: "🌧️", label: "Showers" };
  if (code <= 86) return { emoji: "🌨️", label: "Snow showers" };
  return { emoji: "⛈️", label: "Thunderstorm" };
}
