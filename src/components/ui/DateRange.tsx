"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { sound } from "@/lib/audio";
import { cn } from "@/lib/format";

export function isoToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string) {
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86_400_000);
}

export function prettyDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    big: `${d.getDate()} ${d.toLocaleDateString("en-IN", { month: "short" })}’${String(d.getFullYear()).slice(2)}`,
    small: d.toLocaleDateString("en-IN", { weekday: "long" }),
    short: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  };
}

/** Opens the native picker on desktop (where clicking the field text wouldn't); mobile taps the input directly. */
function openPicker(e: MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* Safari < 16.4 opens the picker natively on tap */
  }
}

interface Props {
  start: string;
  /** Trip length: days (inclusive) for itineraries, nights for stays. */
  length: number;
  onChange: (start: string, length: number) => void;
  unit?: "days" | "nights";
  maxLength?: number;
  labels?: [string, string];
  variant?: "fields" | "pill";
  className?: string;
}

/**
 * Start + end date picker. Each field overlays a real native <input type="date">,
 * so tapping anywhere opens the OS date picker (iOS wheel, Android calendar, desktop popup).
 */
export function DateRange({ start, length, onChange, unit = "days", maxLength = 10, labels, variant = "fields", className }: Props) {
  const [s, setS] = useState(start || isoToday(21));
  useEffect(() => setS(start || isoToday(21)), [start]);

  const offset = unit === "days" ? length - 1 : length;
  const end = addDaysISO(s, Math.max(unit === "days" ? 0 : 1, offset));
  const minEnd = addDaysISO(s, unit === "days" ? 0 : 1);
  const maxEnd = addDaysISO(s, unit === "days" ? maxLength - 1 : maxLength);
  const [l1, l2] = labels ?? (unit === "days" ? ["Start date", "End date"] : ["Check-in", "Check-out"]);

  const setStart = (v: string) => {
    if (!v) return;
    sound.play("tick");
    setS(v);
    onChange(v, length);
  };
  const setEnd = (v: string) => {
    if (!v) return;
    sound.play("tick");
    const d = diffDays(s, v);
    const len = unit === "days" ? d + 1 : d;
    onChange(s, Math.min(maxLength, Math.max(1, len)));
  };

  const A = prettyDate(s);
  const B = prettyDate(end);
  const count = unit === "days" ? `${length} day${length > 1 ? "s" : ""}` : `${length} night${length > 1 ? "s" : ""}`;

  if (variant === "pill")
    return (
      <div className={cn("inline-flex items-stretch overflow-hidden rounded-2xl border border-[var(--line)] bg-white/70 text-sm shadow-sm dark:bg-white/5", className)}>
        <span className="flex items-center pl-3 text-rose-500">
          <CalendarDays className="h-4 w-4" />
        </span>
        <label className="relative flex cursor-pointer flex-col justify-center px-3 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-55">{l1}</span>
          <span className="font-bold">{A.short}</span>
          <input type="date" value={s} min={isoToday()} onClick={openPicker} onChange={(e) => setStart(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer text-base opacity-0" aria-label={l1} />
        </label>
        <span className="my-2 w-px bg-[var(--line)]" />
        <label className="relative flex cursor-pointer flex-col justify-center px-3 py-1.5 hover:bg-black/[0.03] dark:hover:bg-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-55">{l2}</span>
          <span className="font-bold">{B.short}</span>
          <input type="date" value={end} min={minEnd} max={maxEnd} onClick={openPicker} onChange={(e) => setEnd(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer text-base opacity-0" aria-label={l2} />
        </label>
        <span className="flex items-center bg-marigold-50 px-3 text-xs font-bold text-marigold-700 dark:bg-marigold-500/15 dark:text-marigold-300">{count}</span>
      </div>
    );

  return (
    <div className={cn("grid grid-cols-2", className)}>
      <label className="relative min-w-0 cursor-pointer border-r border-[var(--line)] px-4 py-3 transition hover:bg-marigold-50/60 dark:hover:bg-white/5">
        <span className="block text-[11px] font-bold uppercase tracking-wider opacity-60">{l1}</span>
        <span className="mt-0.5 block text-[1.45rem] font-extrabold leading-tight sm:text-[1.6rem]">{A.big}</span>
        <span className="muted block text-xs">{A.small}</span>
        <input type="date" value={s} min={isoToday()} onClick={openPicker} onChange={(e) => setStart(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer text-base opacity-0" aria-label={l1} />
      </label>
      <label className="relative min-w-0 cursor-pointer px-4 py-3 transition hover:bg-marigold-50/60 dark:hover:bg-white/5">
        <span className="block text-[11px] font-bold uppercase tracking-wider opacity-60">{l2}</span>
        <span className="mt-0.5 block text-[1.45rem] font-extrabold leading-tight sm:text-[1.6rem]">{B.big}</span>
        <span className="muted block text-xs">
          {B.small} · <b className="text-rose-700 dark:text-rose-300">{count}</b>
        </span>
        <input type="date" value={end} min={minEnd} max={maxEnd} onClick={openPicker} onChange={(e) => setEnd(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer text-base opacity-0" aria-label={l2} />
      </label>
    </div>
  );
}
