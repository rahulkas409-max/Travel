"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Gauge, Info, OctagonAlert } from "lucide-react";
import { cn, duration, inr } from "@/lib/format";
import type { DayAnalysis, PacingWarning as Warning } from "@/lib/itinerary";

const LEVEL = {
  danger: { icon: OctagonAlert, cls: "border-rose-300/70 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200" },
  warn: { icon: AlertTriangle, cls: "border-marigold-400/60 bg-marigold-50 text-marigold-700 dark:border-marigold-500/30 dark:bg-marigold-500/10 dark:text-marigold-200" },
  info: { icon: Info, cls: "border-sage-300/70 bg-sage-50 text-sage-700 dark:border-sage-500/30 dark:bg-sage-500/10 dark:text-sage-200" },
} as const;

export function loadLabel(load: number) {
  if (load > 115) return { label: "Unrealistic", tone: "text-rose-700 dark:text-rose-300", bar: "from-rose-500 to-rose-600" };
  if (load > 100) return { label: "Tight", tone: "text-marigold-600 dark:text-marigold-400", bar: "from-marigold-500 to-rose-500" };
  if (load < 60) return { label: "Easy-going", tone: "text-sage-700 dark:text-sage-300", bar: "from-sage-400 to-sage-500" };
  return { label: "Well paced", tone: "text-sage-700 dark:text-sage-300", bar: "from-sage-500 to-marigold-400" };
}

/** Pacing meter for one day + its warnings (ghat delays, sunset timing, curfews…). */
export function PacingWarning({ analysis, extra = [], onFocusItem }: { analysis: DayAnalysis; extra?: Warning[]; onFocusItem?: (uid: string) => void }) {
  const l = loadLabel(analysis.load);
  const warnings = [...extra, ...analysis.warnings];
  const width = Math.min(100, (analysis.load / 130) * 100);

  return (
    <div className="glass p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white/10">
          <Gauge className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">Pacing meter</p>
            <p className={cn("text-sm font-bold", l.tone)}>
              {l.label} · {analysis.load}%
            </p>
          </div>
          <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-white/10">
            <div className="absolute inset-y-0 left-[76.9%] w-px bg-stone-500/50" title="Your pace limit" />
            <motion.div
              className={cn("h-full rounded-full bg-gradient-to-r", l.bar)}
              initial={false}
              animate={{ width: `${width}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>
        </div>
      </div>
      <div className="muted mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <Stat label="Activities" value={duration(analysis.activeMins)} />
        <Stat label="Transit" value={duration(analysis.transitMins)} />
        <Stat label="Tickets pp" value={analysis.cost ? inr(analysis.cost) : "Free"} />
      </div>
      <AnimatePresence initial={false}>
        {warnings.length > 0 && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 space-y-2 overflow-hidden">
            {warnings.map((w) => {
              const { icon: Icon, cls } = LEVEL[w.level];
              return (
                <motion.li key={w.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={cn("rounded-xl border px-3 py-2 text-xs", cls)}>
                  <button
                    type="button"
                    disabled={!w.itemUid || !onFocusItem}
                    onClick={() => w.itemUid && onFocusItem?.(w.itemUid)}
                    className="flex w-full gap-2 text-left disabled:cursor-default"
                  >
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      <span className="font-semibold">{w.title}.</span> {w.detail}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] py-2 dark:bg-white/5">
      <p className="text-sm font-bold text-[var(--ink)]">{value}</p>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}
