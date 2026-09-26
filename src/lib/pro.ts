"use client";

import { useCallback, useEffect, useState } from "react";
import { readJSON, STORAGE_KEYS, writeJSON, removeKey } from "./storage";

export interface ProState {
  code: string;
  expires: string;
}

export interface ProBranding {
  orgName: string;
  /** Data-URL (PNG/JPEG, downscaled) — stored only on this device. */
  logo?: string;
  preparedBy?: string;
  hideRoamIndia: boolean;
  includeRoster: boolean;
  includeCosts: boolean;
}

export interface ProCosts {
  stayPerNight: number;
  transportTotal: number;
  foodPerPersonPerDay: number;
  activitiesPerPerson: number;
  extrasTotal: number;
}

export const DEFAULT_BRANDING: ProBranding = { orgName: "", hideRoamIndia: false, includeRoster: true, includeCosts: true };
export const DEFAULT_COSTS: ProCosts = { stayPerNight: 0, transportTotal: 0, foodPerPersonPerDay: 600, activitiesPerPerson: 0, extrasTotal: 0 };

const EVENT = "roamindia:pro-change";

function isActive(p: ProState | null): p is ProState {
  return !!p && new Date(`${p.expires}T23:59:59`).getTime() >= Date.now();
}

/** Pro unlock state shared across components (LocalStorage + a window event). */
export function usePro() {
  const [pro, setPro] = useState<ProState | null>(null);
  const [branding, setBrandingState] = useState<ProBranding>(DEFAULT_BRANDING);
  const [costs, setCostsState] = useState<ProCosts>(DEFAULT_COSTS);

  useEffect(() => {
    const load = () => {
      const p = readJSON<ProState | null>(STORAGE_KEYS.pro, null);
      setPro(isActive(p) ? p : null);
      setBrandingState({ ...DEFAULT_BRANDING, ...readJSON<Partial<ProBranding>>(STORAGE_KEYS.proBranding, {}) });
      setCostsState({ ...DEFAULT_COSTS, ...readJSON<Partial<ProCosts>>(STORAGE_KEYS.proCosts, {}) });
    };
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, []);

  const unlock = useCallback(async (code: string): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch("/api/pro/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (data.ok) {
        writeJSON(STORAGE_KEYS.pro, { code: code.trim().toUpperCase(), expires: data.expires });
        window.dispatchEvent(new Event(EVENT));
        return { ok: true, message: `Pro unlocked until ${new Date(`${data.expires}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` };
      }
      const reason: Record<string, string> = {
        expired: "This code has expired — renew to continue.",
        invalid: "That code doesn't look right. Check for typos.",
        "not-configured": "Pro codes aren't enabled on this site yet.",
        "rate-limited": "Too many attempts — try again in a few minutes.",
      };
      return { ok: false, message: reason[data.reason] ?? "Couldn't verify the code." };
    } catch {
      return { ok: false, message: "You're offline — connect to verify your code." };
    }
  }, []);

  const signOut = useCallback(() => {
    removeKey(STORAGE_KEYS.pro);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const setBranding = useCallback((b: Partial<ProBranding>) => {
    const next = { ...DEFAULT_BRANDING, ...readJSON<Partial<ProBranding>>(STORAGE_KEYS.proBranding, {}), ...b };
    writeJSON(STORAGE_KEYS.proBranding, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const setCosts = useCallback((c: Partial<ProCosts>) => {
    const next = { ...DEFAULT_COSTS, ...readJSON<Partial<ProCosts>>(STORAGE_KEYS.proCosts, {}), ...c };
    writeJSON(STORAGE_KEYS.proCosts, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { pro, isPro: !!pro, unlock, signOut, branding, setBranding, costs, setCosts };
}

/** Downscale an uploaded logo to ≤ 320px so it fits comfortably in LocalStorage. */
export function fileToLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 320 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unsupported image"));
    };
    img.src = url;
  });
}
