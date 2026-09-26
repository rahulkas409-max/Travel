/**
 * Image engine.
 *
 * Every destination, activity and stay references an `imageKey` (a theme
 * keyword). Keys resolve to curated Unsplash photos served from the imgix CDN
 * (which supports on-the-fly resizing and CORS, so blob downloads work).
 *
 * If a photo ever fails to load — offline, blocked CDN, removed photo — the
 * UI swaps in locally generated "postcard" art drawn on a canvas, so nothing
 * ever looks broken and downloads still produce a real PNG.
 */

import { hashString } from "./format";

export type ArtFamily = "mountain" | "beach" | "palace" | "forest" | "city" | "food" | "stay" | "farm";

interface Theme {
  family: ArtFamily;
  ids: string[];
}

const P = {
  mountain: ["1506905925346-21bda4d32df4", "1464822759023-fed622ff2c3b", "1454496522488-7a8e488e8606", "1519681393784-d120267933ba"],
  snow: ["1454496522488-7a8e488e8606", "1519681393784-d120267933ba", "1626621341517-bbf3d9990a23"],
  himachal: ["1626621341517-bbf3d9990a23", "1506905925346-21bda4d32df4"],
  ladakh: ["1506461883276-594a12b11cf3", "1464822759023-fed622ff2c3b"],
  lake: ["1501785888041-af3ef285b470", "1476514525535-07fb3b4ae5f1"],
  beach: ["1507525428034-b723cf961d3e", "1519046904884-53103b34b206", "1505142468610-359e7d316be0"],
  goa: ["1512343879784-a960bf40e7f2", "1507525428034-b723cf961d3e"],
  forest: ["1441974231531-c6227db76b6e", "1470071459604-3b5ec3a7fe05", "1448375240586-882707db888b", "1473448912268-2022ce9509d8"],
  waterfall: ["1432405972618-c60b0225b8f9", "1433086966358-54859d0ed716"],
  desert: ["1509316785289-025f5b846b35", "1473580044384-7ba9967e16a0"],
  palace: ["1524492412937-b28074a5d7da", "1564507592333-c60657eea523", "1548013146-72479768bada"],
  jaipur: ["1477587458883-47145ed94245", "1524492412937-b28074a5d7da"],
  varanasi: ["1561361513-2d000a50f0dc"],
  kerala: ["1602216056096-3b40cc0c9944"],
  tea: ["1593693397690-362cb9666fc2"],
  delhi: ["1587474260584-136574528ed5", "1564507592333-c60657eea523"],
  mumbai: ["1570168007204-dfb528c6958f"],
  farm: ["1500382017468-9049fed747ef", "1464226184884-fa280b87c399", "1500076656116-558758c991c1"],
  pool: ["1566073771259-6a8506099945", "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d"],
  room: ["1582719478250-c89cae4dc85b", "1631049307264-da0ec9d70304"],
  hostel: ["1555854877-bab0e564b8d5"],
  villa: ["1542314831-068cd1dbfeeb", "1566073771259-6a8506099945"],
  cafe: ["1509042239860-f550ce710b93", "1517248135467-4c7edcad34c4"],
  coffee: ["1447933601403-0c6688de566e", "1509042239860-f550ce710b93"],
  food: ["1504674900247-0877df9cc836", "1565557623262-b51c2513a641", "1585937421612-70a008356fbe", "1589302168068-964664d93dc0"],
  dining: ["1414235077428-338989a2e8c0", "1517248135467-4c7edcad34c4"],
  camp: ["1504280390367-361c6d9f38f4"],
  team: ["1511578314322-379afb476865", "1522071820081-009f0129c71c"],
  friends: ["1529156069898-49953e39b3ac", "1516450360452-9312f5e86fc7"],
  romance: ["1519741497674-611481863552"],
  travel: ["1503220317375-aaad61436b1b", "1488646953014-85cb44e25828"],
};

const THEMES: Record<string, Theme> = {
  // Destinations
  delhi: { family: "palace", ids: P.delhi },
  jaipur: { family: "palace", ids: P.jaipur },
  varanasi: { family: "palace", ids: P.varanasi },
  amritsar: { family: "palace", ids: P.palace },
  kashmir: { family: "mountain", ids: P.lake },
  himachal: { family: "mountain", ids: P.himachal },
  city: { family: "city", ids: P.travel },
  snow: { family: "mountain", ids: P.snow },
  ladakh: { family: "mountain", ids: P.ladakh },
  mountain: { family: "mountain", ids: P.mountain },
  forest: { family: "forest", ids: P.forest },
  mumbai: { family: "city", ids: P.mumbai },
  farmhouse: { family: "farm", ids: [...P.pool, ...P.farm] },
  udaipur: { family: "palace", ids: P.palace },
  rajasthan: { family: "palace", ids: [...P.jaipur, ...P.desert] },
  goa: { family: "beach", ids: P.goa },
  beach: { family: "beach", ids: P.beach },
  hampi: { family: "palace", ids: P.desert },
  desert: { family: "beach", ids: P.desert },
  villa: { family: "stay", ids: P.villa },
  fort: { family: "palace", ids: P.palace },
  temple: { family: "palace", ids: P.palace },
  hyderabad: { family: "palace", ids: P.palace },
  kerala: { family: "forest", ids: P.kerala },
  palace: { family: "palace", ids: P.palace },
  pondicherry: { family: "beach", ids: P.beach },
  tea: { family: "forest", ids: P.tea },
  coffee: { family: "forest", ids: P.coffee },
  lake: { family: "mountain", ids: P.lake },
  kolkata: { family: "city", ids: P.travel },
  heritage: { family: "palace", ids: P.palace },
  waterfall: { family: "forest", ids: P.waterfall },
  mangrove: { family: "forest", ids: P.forest },
  jungle: { family: "forest", ids: P.forest },
  gorge: { family: "forest", ids: P.waterfall },
  river: { family: "forest", ids: P.lake },
  meghalaya: { family: "forest", ids: [...P.waterfall, ...P.forest] },
  valley: { family: "mountain", ids: P.mountain },
  // Stays
  hostel: { family: "stay", ids: P.hostel },
  pool: { family: "stay", ids: P.pool },
  "heritage-room": { family: "stay", ids: P.room },
  "beach-hut": { family: "beach", ids: P.beach },
  haveli: { family: "palace", ids: [...P.jaipur, ...P.room] },
  cafe: { family: "food", ids: P.cafe },
  cottage: { family: "forest", ids: P.forest },
  farm: { family: "farm", ids: P.farm },
  pottery: { family: "farm", ids: P.farm },
  lawn: { family: "farm", ids: [...P.team, ...P.farm] },
  camp: { family: "forest", ids: P.camp },
  orchard: { family: "farm", ids: P.farm },
  treehouse: { family: "forest", ids: P.forest },
  // Activity kinds
  "kind-heritage": { family: "palace", ids: P.palace },
  "kind-nature": { family: "forest", ids: [...P.forest, ...P.lake] },
  "kind-adventure": { family: "mountain", ids: [...P.mountain, ...P.travel] },
  "kind-food": { family: "food", ids: P.food },
  "kind-nightlife": { family: "city", ids: P.friends },
  "kind-wellness": { family: "stay", ids: P.pool },
  "kind-learning": { family: "palace", ids: [...P.palace, ...P.farm] },
  "kind-team": { family: "farm", ids: P.team },
  "kind-spiritual": { family: "palace", ids: [...P.varanasi, ...P.palace] },
  "kind-shopping": { family: "city", ids: P.travel },
  "kind-beach": { family: "beach", ids: P.beach },
  "kind-romance": { family: "beach", ids: [...P.romance, ...P.dining] },
  food: { family: "food", ids: P.food },
};

const FALLBACK_THEME: Theme = { family: "city", ids: P.travel };

export function themeFor(key: string): Theme {
  return THEMES[key] ?? FALLBACK_THEME;
}

export function unsplashUrl(id: string, w: number, h?: number, q = 80): string {
  const size = h ? `&w=${w}&h=${h}` : `&w=${w}`;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop${size}&q=${q}`;
}

export interface ResolvedImage {
  key: string;
  id: string;
  family: ArtFamily;
  label: string;
  /** Card-sized image. */
  src: string;
  /** 2400px original-quality for downloads. */
  hiRes: string;
  /** Phone wallpaper crop (1290×2796 — iPhone Pro Max size, scales down well). */
  wallpaper: string;
  credit: string;
  /* Open-licensed (Wikimedia) images carry attribution details. */
  open?: boolean;
  provider?: string;
  sourceUrl?: string;
  file?: string | null;
  author?: string;
  license?: string;
}

/**
 * Resolve an image for a theme key. `seed` picks a stable variant so the same
 * activity always shows the same photo while siblings look different.
 */
export function getImage(key: string, label: string, seed: string | number = 0, width = 900): ResolvedImage {
  const theme = themeFor(key);
  const idx = hashString(`${key}:${seed}`) % theme.ids.length;
  const id = theme.ids[idx];
  return {
    key,
    id,
    family: theme.family,
    label,
    src: unsplashUrl(id, width, Math.round(width * 0.66)),
    hiRes: unsplashUrl(id, 2400, undefined, 90),
    wallpaper: unsplashUrl(id, 1290, 2796, 88),
    credit: "Photo via Unsplash",
  };
}

/* ─────────────────────────── Fallback postcard art ─────────────────────────── */

const PALETTES: Record<ArtFamily, [string, string, string]> = {
  mountain: ["#1e3a5f", "#7aa2c7", "#faf7f2"],
  beach: ["#f59e0b", "#e06d53", "#fde68a"],
  palace: ["#e06d53", "#f59e0b", "#fef3c7"],
  forest: ["#385537", "#588157", "#dbe7d6"],
  city: ["#0b0f19", "#e06d53", "#f59e0b"],
  food: ["#a8432e", "#f59e0b", "#fff7ed"],
  stay: ["#588157", "#f59e0b", "#faf7f2"],
  farm: ["#466a45", "#f59e0b", "#fef9c3"],
};

/** Draws a stylised travel-poster illustration. Canvas-only so it never taints and works on iOS. */
export function drawPostcard(ctx: CanvasRenderingContext2D, w: number, h: number, family: ArtFamily, label: string, withLabel = true) {
  const [c1, c2, c3] = PALETTES[family];
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, c1);
  sky.addColorStop(0.65, c2);
  sky.addColorStop(1, c3);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Sun
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(w * 0.72, h * 0.34, Math.min(w, h) * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const base = h * 0.72;
  ctx.fillStyle = "rgba(11,15,25,0.35)";
  if (family === "mountain") {
    ctx.beginPath();
    ctx.moveTo(0, base);
    ctx.lineTo(w * 0.25, h * 0.35);
    ctx.lineTo(w * 0.45, base * 0.9);
    ctx.lineTo(w * 0.68, h * 0.28);
    ctx.lineTo(w, base);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.28);
    ctx.lineTo(w * 0.62, h * 0.38);
    ctx.lineTo(w * 0.74, h * 0.38);
    ctx.fill();
  } else if (family === "beach") {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + i * 0.08})`;
      ctx.beginPath();
      ctx.moveTo(0, base + i * h * 0.06);
      for (let x = 0; x <= w; x += w / 12) ctx.quadraticCurveTo(x + w / 24, base + i * h * 0.06 - 12, x + w / 12, base + i * h * 0.06);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
    }
    // Palm
    ctx.strokeStyle = "rgba(11,15,25,0.6)";
    ctx.lineWidth = Math.max(4, w * 0.01);
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h);
    ctx.quadraticCurveTo(w * 0.2, h * 0.6, w * 0.26, h * 0.42);
    ctx.stroke();
  } else if (family === "palace") {
    ctx.fillStyle = "rgba(11,15,25,0.4)";
    const domeW = w * 0.22;
    ctx.fillRect(w * 0.2, base - h * 0.18, w * 0.6, h * 0.18 + (h - base));
    ctx.beginPath();
    ctx.ellipse(w * 0.5, base - h * 0.18, domeW / 2, h * 0.13, 0, Math.PI, 0);
    ctx.fill();
    for (const x of [0.24, 0.76]) {
      ctx.fillRect(w * x - 8, base - h * 0.34, 16, h * 0.34);
      ctx.beginPath();
      ctx.arc(w * x, base - h * 0.34, 14, Math.PI, 0);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(253,230,138,0.55)";
    for (let i = 0; i < 5; i++) {
      const ax = w * (0.28 + i * 0.11);
      ctx.beginPath();
      ctx.moveTo(ax, h);
      ctx.lineTo(ax, base - h * 0.05);
      ctx.arc(ax + w * 0.03, base - h * 0.05, w * 0.03, Math.PI, 0);
      ctx.lineTo(ax + w * 0.06, h);
      ctx.fill();
    }
  } else if (family === "forest" || family === "farm") {
    for (let i = 0; i < 14; i++) {
      const x = (i / 13) * w;
      const th = h * (0.18 + ((i * 37) % 10) / 40);
      ctx.fillStyle = `rgba(20,40,20,${0.35 + (i % 3) * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(x, base - th);
      ctx.lineTo(x - w * 0.05, base + h * 0.05);
      ctx.lineTo(x + w * 0.05, base + h * 0.05);
      ctx.fill();
    }
    ctx.fillStyle = family === "farm" ? "rgba(245,158,11,0.45)" : "rgba(56,85,55,0.6)";
    ctx.fillRect(0, base + h * 0.04, w, h);
  } else {
    for (let i = 0; i < 9; i++) {
      const bw = w / 9;
      const bh = h * (0.15 + ((i * 53) % 10) / 30);
      ctx.fillStyle = `rgba(11,15,25,${0.35 + (i % 3) * 0.1})`;
      ctx.fillRect(i * bw, base - bh, bw - 4, bh + (h - base));
    }
  }

  if (!withLabel) return;
  // Label
  const fontSize = Math.round(Math.min(w, h) * 0.075);
  ctx.fillStyle = "rgba(11,15,25,0.55)";
  ctx.fillRect(0, h - fontSize * 2.4, w, fontSize * 2.4);
  ctx.fillStyle = "#faf7f2";
  ctx.font = `600 ${fontSize}px Georgia, 'Times New Roman', serif`;
  ctx.textBaseline = "middle";
  const text = label.length > 42 ? `${label.slice(0, 40)}…` : label;
  ctx.fillText(text, fontSize * 0.8, h - fontSize * 1.2);
  ctx.font = `500 ${Math.round(fontSize * 0.42)}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(250,247,242,0.8)";
  ctx.textAlign = "right";
  ctx.fillText("ROAMINDIA", w - fontSize * 0.8, fontSize * 0.9);
  ctx.textAlign = "left";
}

const artCache = new Map<string, string>();

/** Data-URL postcard for <img> fallbacks. Client-only. */
export function postcardDataUrl(family: ArtFamily, label: string, w = 900, h = 600, withLabel = true): string {
  const cacheKey = `${family}|${withLabel ? label : ""}|${w}x${h}`;
  const cached = artCache.get(cacheKey);
  if (cached) return cached;
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  drawPostcard(ctx, w, h, family, label, withLabel);
  const url = canvas.toDataURL("image/jpeg", 0.88);
  artCache.set(cacheKey, url);
  return url;
}

function postcardBlob(family: ArtFamily, label: string, w: number, h: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas unavailable"));
    drawPostcard(ctx, w, h, family, label);
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), "image/png");
  });
}

/* ─────────────────────────── Downloads ─────────────────────────── */

export type SaveMode = "photo" | "wallpaper";
export type SaveResult = "downloaded" | "shared" | "opened" | "generated";

export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const probe = new File([new Blob(["x"], { type: "image/png" })], "probe.png", { type: "image/png" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function fetchBlob(url: string, timeoutMs = 15000): Promise<Blob | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { mode: "cors", signal: ctrl.signal, cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return blob.size > 0 ? blob : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Triggers a real file download from a Blob — works on desktop, Android and iOS 13+ Safari. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // iOS needs the URL alive long enough for the download sheet.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Centre-crop any image blob to 1290×2796 (phone wallpaper) with a canvas. */
async function cropToWallpaper(blob: Blob): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(blob);
    const W = 1290;
    const H = 2796;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const scale = Math.max(W / bmp.width, H / bmp.height);
    const dw = bmp.width * scale;
    const dh = bmp.height * scale;
    ctx.drawImage(bmp, (W - dw) / 2, (H - dh) / 2, dw, dh);
    bmp.close?.();
    return await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.9));
  } catch {
    return null;
  }
}

/**
 * Save a high-res image to the device.
 * - `share: true` opens the native share sheet (iOS/iPadOS "Save Image" → Photos).
 * - Otherwise downloads via a blob URL + `download` attribute.
 * - If the CDN can't be reached, a generated postcard PNG is saved instead.
 */
export async function saveImage(
  image: ResolvedImage,
  opts: { mode?: SaveMode; share?: boolean } = {},
): Promise<SaveResult> {
  const mode = opts.mode ?? "photo";
  const url = mode === "wallpaper" ? image.wallpaper : image.hiRes;
  const base = image.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "roamindia";

  let blob = await fetchBlob(url);
  let generated = false;
  // Wikimedia originals aren't server-cropped — crop to a phone wallpaper locally.
  if (blob && mode === "wallpaper" && image.open) blob = (await cropToWallpaper(blob)) ?? blob;
  if (!blob) {
    const [w, h] = mode === "wallpaper" ? [1290, 2796] : [2400, 1600];
    blob = await postcardBlob(image.family, image.label, w, h);
    generated = true;
  }
  const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : blob.type.includes("avif") ? "avif" : "jpg";
  const filename = `roamindia-${base}${mode === "wallpaper" ? "-wallpaper" : ""}.${ext}`;

  if (opts.share && canShareFiles()) {
    const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
    try {
      await navigator.share({ files: [file], title: image.label });
      return "shared";
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return "shared";
      // fall through to download
    }
  }
  downloadBlob(blob, filename);
  return generated ? "generated" : "downloaded";
}
