"use client";

import { DEFAULT_DESTINATION_ID } from "@data/destinations";
import { OCCASION_BY_ID } from "@data/occasions";
import type { Occasion, Pace } from "@data/types";
import { sound } from "@/lib/audio";
import { getDestination, type ResolvedDestination } from "@/lib/destinations";
import { generatePlan, newUid, type PlanDay, type TripConfig } from "@/lib/itinerary";
import { readJSON, STORAGE_KEYS, writeJSON, clearAll } from "@/lib/storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";

export interface RouletteWin {
  id: string;
  destinationId: string;
  occasion: Occasion;
  percent: number;
  at: string;
}

export type ThemePref = "light" | "dark" | "system";

interface TripState {
  config: TripConfig;
  plan: PlanDay[];
  savedStays: string[];
  rouletteWins: RouletteWin[];
}

const DEFAULT_CONFIG: TripConfig = {
  destinationId: DEFAULT_DESTINATION_ID,
  occasion: "solo",
  pace: "balanced",
  days: 3,
  budget: 3500,
  travellers: 2,
  startDate: "",
  seed: 1,
};

function initialState(): TripState {
  const dest = getDestination(DEFAULT_CONFIG.destinationId);
  return { config: DEFAULT_CONFIG, plan: generatePlan(dest, DEFAULT_CONFIG), savedStays: [], rouletteWins: [] };
}

type Action =
  | { type: "hydrate"; state: TripState }
  | { type: "config"; patch: Partial<TripConfig>; regenerate: boolean }
  | { type: "regenerate" }
  | { type: "setDayItems"; dayIdx: number; items: PlanDay["items"] }
  | { type: "swap"; dayIdx: number; itemIdx: number; activityId: string }
  | { type: "remove"; dayIdx: number; itemIdx: number }
  | { type: "add"; dayIdx: number; activityId: string }
  | { type: "toggleStay"; id: string }
  | { type: "win"; win: RouletteWin }
  | { type: "clearWins" }
  | { type: "reset" };

function reducer(state: TripState, action: Action): TripState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "config": {
      const config = { ...state.config, ...action.patch };
      if (!action.regenerate) return { ...state, config };
      return { ...state, config, plan: generatePlan(getDestination(config.destinationId), config) };
    }
    case "regenerate": {
      const config = { ...state.config, seed: state.config.seed + 1 };
      return { ...state, config, plan: generatePlan(getDestination(config.destinationId), config) };
    }
    case "setDayItems":
      return { ...state, plan: state.plan.map((d, i) => (i === action.dayIdx ? { ...d, items: action.items } : d)) };
    case "swap":
      return {
        ...state,
        plan: state.plan.map((d, i) =>
          i === action.dayIdx
            ? { ...d, items: d.items.map((it, j) => (j === action.itemIdx ? { uid: newUid(), activityId: action.activityId } : it)) }
            : d,
        ),
      };
    case "remove":
      return {
        ...state,
        plan: state.plan.map((d, i) => (i === action.dayIdx ? { ...d, items: d.items.filter((_, j) => j !== action.itemIdx) } : d)),
      };
    case "add":
      return {
        ...state,
        plan: state.plan.map((d, i) =>
          i === action.dayIdx ? { ...d, items: [...d.items, { uid: newUid(), activityId: action.activityId }] } : d,
        ),
      };
    case "toggleStay": {
      const has = state.savedStays.includes(action.id);
      return { ...state, savedStays: has ? state.savedStays.filter((s) => s !== action.id) : [...state.savedStays, action.id] };
    }
    case "win":
      return { ...state, rouletteWins: [action.win, ...state.rouletteWins].slice(0, 20) };
    case "clearWins":
      return { ...state, rouletteWins: [] };
    case "reset":
      return initialState();
  }
}

/* ─────────────────────────── Toasts ─────────────────────────── */

export interface Toast {
  id: number;
  message: string;
  tone: "default" | "success" | "warn";
}

/* ─────────────────────────── Context ─────────────────────────── */

interface TripContextValue {
  hydrated: boolean;
  config: TripConfig;
  plan: PlanDay[];
  destination: ResolvedDestination;
  savedStays: string[];
  rouletteWins: RouletteWin[];
  muted: boolean;
  theme: ThemePref;
  toasts: Toast[];
  setDestination: (id: string) => void;
  setOccasion: (o: Occasion) => void;
  setPace: (p: Pace) => void;
  setDays: (n: number) => void;
  setBudget: (n: number) => void;
  setTravellers: (n: number) => void;
  setStartDate: (iso: string) => void;
  regenerate: () => void;
  setDayItems: (dayIdx: number, items: PlanDay["items"]) => void;
  moveItem: (dayIdx: number, from: number, to: number) => void;
  swapItem: (dayIdx: number, itemIdx: number, activityId: string) => void;
  removeItem: (dayIdx: number, itemIdx: number) => void;
  addItem: (dayIdx: number, activityId: string) => void;
  toggleSavedStay: (id: string) => void;
  addRouletteWin: (w: Omit<RouletteWin, "id" | "at">) => void;
  clearRouletteWins: () => void;
  startTrip: (destinationId: string, occasion: Occasion, days?: number, budget?: number) => void;
  toggleMute: () => void;
  setTheme: (t: ThemePref) => void;
  resetEverything: () => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);
  const [muted, setMuted] = useState(false);
  const [theme, setThemeState] = useState<ThemePref>("system");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // Hydrate from LocalStorage once on the client.
  useEffect(() => {
    const saved = readJSON<Partial<TripState> | null>(STORAGE_KEYS.trip, null);
    const savedStays = readJSON<string[]>(STORAGE_KEYS.savedStays, []);
    const rouletteWins = readJSON<RouletteWin[]>(STORAGE_KEYS.rouletteWins, []);
    const base = initialState();
    const config = { ...base.config, ...(saved?.config ?? {}) };
    const dest = getDestination(config.destinationId);
    config.destinationId = dest.id;
    const planValid = Array.isArray(saved?.plan) && saved!.plan!.length === config.days && saved!.plan!.every((d) => Array.isArray(d.items));
    dispatch({
      type: "hydrate",
      state: { config, plan: planValid ? saved!.plan! : generatePlan(dest, config), savedStays, rouletteWins },
    });
    const m = readJSON<boolean>(STORAGE_KEYS.muted, false);
    setMuted(m);
    sound.setMuted(m);
    setThemeState(readJSON<ThemePref>(STORAGE_KEYS.theme, "system"));
    setHydrated(true);
  }, []);

  // Persist.
  useEffect(() => {
    if (!hydrated) return;
    writeJSON(STORAGE_KEYS.trip, { config: state.config, plan: state.plan });
    writeJSON(STORAGE_KEYS.savedStays, state.savedStays);
    writeJSON(STORAGE_KEYS.rouletteWins, state.rouletteWins);
  }, [hydrated, state]);

  // Theme application.
  useEffect(() => {
    if (!hydrated) return;
    writeJSON(STORAGE_KEYS.theme, theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0b0f19" : "#faf7f2");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [hydrated, theme]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const destination = useMemo(() => getDestination(state.config.destinationId), [state.config.destinationId]);

  const value = useMemo<TripContextValue>(() => {
    const cfg = state.config;
    return {
      hydrated,
      config: cfg,
      plan: state.plan,
      destination,
      savedStays: state.savedStays,
      rouletteWins: state.rouletteWins,
      muted,
      theme,
      toasts,
      setDestination: (id) => {
        if (id === cfg.destinationId) return;
        const d = getDestination(id);
        const days = Math.min(Math.max(cfg.days, d.idealDays[0]), Math.max(d.idealDays[1], 2));
        dispatch({ type: "config", patch: { destinationId: id, days }, regenerate: true });
        toast(`📍 Planning ${d.name} · ${days} days`);
      },
      setOccasion: (o) => {
        if (o === cfg.occasion) return;
        dispatch({ type: "config", patch: { occasion: o }, regenerate: true });
        toast(`${OCCASION_BY_ID[o].emoji} Itinerary re-tuned for ${OCCASION_BY_ID[o].short}`);
      },
      setPace: (p) => p !== cfg.pace && dispatch({ type: "config", patch: { pace: p }, regenerate: true }),
      setDays: (n) => {
        const days = Math.min(10, Math.max(1, n));
        if (days !== cfg.days) dispatch({ type: "config", patch: { days }, regenerate: true });
      },
      setBudget: (n) => dispatch({ type: "config", patch: { budget: n }, regenerate: false }),
      setTravellers: (n) => dispatch({ type: "config", patch: { travellers: Math.min(200, Math.max(1, n)) }, regenerate: false }),
      setStartDate: (iso) => dispatch({ type: "config", patch: { startDate: iso }, regenerate: false }),
      regenerate: () => dispatch({ type: "regenerate" }),
      setDayItems: (dayIdx, items) => dispatch({ type: "setDayItems", dayIdx, items }),
      moveItem: (dayIdx, from, to) => {
        const items = [...state.plan[dayIdx].items];
        if (to < 0 || to >= items.length) return;
        const [it] = items.splice(from, 1);
        items.splice(to, 0, it);
        dispatch({ type: "setDayItems", dayIdx, items });
      },
      swapItem: (dayIdx, itemIdx, activityId) => dispatch({ type: "swap", dayIdx, itemIdx, activityId }),
      removeItem: (dayIdx, itemIdx) => dispatch({ type: "remove", dayIdx, itemIdx }),
      addItem: (dayIdx, activityId) => dispatch({ type: "add", dayIdx, activityId }),
      toggleSavedStay: (id) => dispatch({ type: "toggleStay", id }),
      addRouletteWin: (w) =>
        dispatch({ type: "win", win: { ...w, id: `${Date.now()}`, at: new Date().toISOString() } }),
      clearRouletteWins: () => dispatch({ type: "clearWins" }),
      startTrip: (destinationId, occasion, days = 3, budget) =>
        dispatch({
          type: "config",
          patch: { destinationId, occasion, days, ...(budget ? { budget } : {}), seed: cfg.seed + 1 },
          regenerate: true,
        }),
      toggleMute: () => {
        const next = !muted;
        setMuted(next);
        sound.setMuted(next);
        writeJSON(STORAGE_KEYS.muted, next);
        if (!next) sound.play("pop");
      },
      setTheme: (t) => setThemeState(t),
      resetEverything: () => {
        clearAll();
        dispatch({ type: "reset" });
        toast("All local data cleared", "success");
      },
      toast,
      dismissToast,
    };
  }, [state, hydrated, destination, muted, theme, toasts, toast, dismissToast]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used inside <TripProvider>");
  return ctx;
}
