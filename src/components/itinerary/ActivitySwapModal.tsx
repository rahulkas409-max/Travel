"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import type { Activity, SlotType } from "@data/types";
import { motion } from "framer-motion";
import { Check, Clock, Dices, MapPin, Plus } from "lucide-react";
import { useMemo } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { zoneName } from "@/lib/destinations";
import { cn, duration, inr } from "@/lib/format";
import { SLOT_META, activityPool, findActivity, swapOptions, type SwapOption } from "@/lib/itinerary";

export type SwapTarget = { mode: "swap"; dayIdx: number; itemIdx: number } | { mode: "add"; dayIdx: number };

/** Re-roll a slot with alternatives matching the current occasion, or add a new stop. */
export function ActivitySwapModal({ target, onClose }: { target: SwapTarget | null; onClose: () => void }) {
  const { destination: dest, plan, config, swapItem, addItem, toast } = useTrip();

  const current = target?.mode === "swap" ? findActivity(dest, plan[target.dayIdx]?.items[target.itemIdx]?.activityId ?? "") : undefined;

  const options: SwapOption[] = useMemo(() => {
    if (!target) return [];
    if (target.mode === "swap") {
      if (!plan[target.dayIdx]?.items[target.itemIdx]) return [];
      return swapOptions(dest, plan, target.dayIdx, target.itemIdx, config);
    }
    const used = new Set(plan.flatMap((d) => d.items.map((i) => i.activityId)));
    return activityPool(dest, config.occasion)
      .filter((a) => !used.has(a.id))
      .filter((a) => !(config.occasion === "school" && a.kind === "nightlife"))
      .map((a) => ({ activity: a, transitDelta: 0, matchesOccasion: a.occasions.includes(config.occasion) }))
      .sort((x, y) => Number(y.matchesOccasion) - Number(x.matchesOccasion) || slotOrder(x.activity.slot) - slotOrder(y.activity.slot));
  }, [target, dest, plan, config]);

  const choose = (a: Activity) => {
    if (!target) return;
    sound.play("flip");
    if (target.mode === "swap") {
      swapItem(target.dayIdx, target.itemIdx, a.id);
      toast(`🔁 Swapped in “${a.name}”`);
    } else {
      addItem(target.dayIdx, a.id);
      toast(`➕ Added “${a.name}” to Day ${target.dayIdx + 1}`);
    }
    onClose();
  };

  const surprise = () => {
    if (!options.length) return;
    const sameSlot = options.filter((o) => !current || o.activity.slot === current.slot);
    const base = sameSlot.length ? sameSlot : options;
    const top = base.filter((o) => o.matchesOccasion);
    const pool = top.length ? top : base;
    choose(pool[Math.floor(Math.random() * pool.length)].activity);
  };

  const occ = OCCASION_BY_ID[config.occasion];

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      size="lg"
      title={target?.mode === "add" ? `Add a stop to Day ${target.dayIdx + 1}` : "Swap activity"}
      subtitle={
        current ? (
          <>
            Replacing <b>{current.name}</b> · {SLOT_META[current.slot].emoji} {SLOT_META[current.slot].label} options for {occ.emoji} {occ.short}
          </>
        ) : (
          `Ideas in ${dest.name} for ${occ.short.toLowerCase()} trips`
        )
      }
      footer={
        options.length > 0 && (
          <button type="button" onClick={surprise} className="btn-primary w-full">
            <Dices className="h-4 w-4" /> Surprise me — re-roll this slot
          </button>
        )
      }
    >
      {options.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-3xl">🗺️</p>
          <p className="mt-2 font-semibold">You&apos;ve used every idea for this slot</p>
          <p className="muted text-sm">Try another time of day, or remove a stop elsewhere to free it up.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {options.map((o, i) => (
            <motion.li key={o.activity.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <button
                type="button"
                onClick={() => choose(o.activity)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/60 p-2 text-left transition hover:border-marigold-500/60 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
              >
                <SmartImage imageKey={`kind-${o.activity.kind}`} label={o.activity.name} seed={o.activity.id} width={220} className="h-20 w-20 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{o.activity.name}</p>
                  <p className="muted mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs">
                    <span>
                      {SLOT_META[o.activity.slot].emoji} {SLOT_META[o.activity.slot].label}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> {duration(o.activity.durationMins)}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" /> {zoneName(dest, o.activity.zone)}
                    </span>
                    <span>{o.activity.cost ? inr(o.activity.cost) : "Free"}</span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {current && o.activity.slot !== current.slot && (
                      <span className="pill !py-0.5 bg-marigold-100 text-marigold-700 dark:bg-marigold-500/15 dark:text-marigold-300">Best at {SLOT_META[o.activity.slot].label.toLowerCase()}</span>
                    )}
                    {o.matchesOccasion && <span className="pill !py-0.5 bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300">{occ.emoji} Match</span>}
                    {target?.mode === "swap" && (
                      <span
                        className={cn(
                          "pill !py-0.5",
                          o.transitDelta > 30 ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-black/5 dark:bg-white/10",
                        )}
                      >
                        {o.transitDelta > 5 ? `+${duration(o.transitDelta)} transit` : o.transitDelta < -5 ? `${duration(-o.transitDelta)} less transit` : "Same area"}
                      </span>
                    )}
                  </div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 transition group-hover:bg-gradient-to-br group-hover:from-marigold-500 group-hover:to-rose-500 group-hover:text-white dark:bg-white/10">
                  {target?.mode === "add" ? <Plus className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

function slotOrder(s: SlotType) {
  return ["morning", "afternoon", "sunset", "night"].indexOf(s);
}
