"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import type { MatchResult } from "@data/roulette";
import type { Occasion } from "@data/types";
import { motion } from "framer-motion";
import { Camera, Dices, MapPinned, Mountain, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { Sheet } from "@/components/ui/Sheet";
import { SmartImage } from "@/components/ui/SmartImage";
import { getDestination } from "@/lib/destinations";
import { clock } from "@/lib/format";
import { destinationSource } from "@/lib/imageSources";
import { SLOT_META, generatePlan, scheduleDay } from "@/lib/itinerary";

interface Props {
  match: MatchResult | null;
  occasion: Occasion;
  budget: number;
  onClose: () => void;
  onPlan: () => void;
  onSpinAgain: () => void;
}

/** The big reveal: winning circuit, why it matched and a starter 3-day plan. */
export function RevealModal({ match, occasion, budget, onClose, onPlan, onSpinAgain }: Props) {
  const { openPhoto } = usePhotoViewer();
  const dest = match ? getDestination(match.destination.id) : null;

  const starter = useMemo(() => {
    if (!dest) return [];
    const cfg = { destinationId: dest.id, occasion, pace: "balanced" as const, days: 3, budget, travellers: 2, startDate: "", seed: 7 };
    return generatePlan(dest, cfg).map((d) => ({ day: d.day, items: scheduleDay(dest, d, "balanced") }));
  }, [dest, occasion, budget]);

  const occ = OCCASION_BY_ID[occasion];

  return (
    <Sheet
      open={!!match}
      onClose={onClose}
      size="lg"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onSpinAgain} className="btn-ghost">
            <Dices className="h-4 w-4" /> Spin again
          </button>
          <button type="button" onClick={onPlan} className="btn-primary">
            <MapPinned className="h-4 w-4" /> Plan this trip
          </button>
        </div>
      }
    >
      {dest && match && (
        <div className="space-y-5">
          <motion.div initial={{ scale: 0.8, rotate: -4, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="tape relative -mt-2">
            <div className="overflow-hidden rounded-3xl shadow-lift">
              <SmartImage source={destinationSource(dest)} width={1200} priority className="h-56 w-full sm:h-64">
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="hand text-lg text-marigold-300">Your surprise trip is…</p>
                  <h2 className="font-display text-4xl font-bold leading-none">{dest.name}</h2>
                  <p className="mt-1 text-sm text-white/85">
                    {dest.state} · <Mountain className="inline h-3.5 w-3.5" /> {dest.elevation.toLocaleString("en-IN")} m · {dest.idealMonths}
                  </p>
                </div>
                <div className="absolute right-4 top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white text-slate-900 shadow-xl">
                  <span className="text-xl font-extrabold leading-none">{match.percent}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wide">match</span>
                </div>
              </SmartImage>
            </div>
          </motion.div>

          <p className="font-display text-lg italic">“{dest.tagline}”</p>

          <div className="flex flex-wrap gap-1.5">
            {match.reasons.map((r, i) => (
              <motion.span key={r} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="pill bg-sage-100 !normal-case !tracking-normal text-sage-700 dark:bg-sage-500/15 dark:text-sage-300">
                <Sparkles className="h-3 w-3" /> {r}
              </motion.span>
            ))}
          </div>

          <section>
            <p className="eyebrow mb-2">
              Starter 3-day plan · {occ.emoji} {occ.short}
            </p>
            <div className="space-y-3">
              {starter.map((d, i) => (
                <motion.div key={d.day} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.12 }} className="rounded-2xl border border-[var(--line)] bg-white/60 p-3 dark:bg-white/[0.03]">
                  <p className="font-display font-semibold">Day {d.day}</p>
                  <ul className="mt-1.5 space-y-1 text-sm">
                    {d.items.map((s) => (
                      <li key={s.item.uid} className="flex gap-2">
                        <span className="w-16 shrink-0 font-semibold tabular-nums text-rose-700 dark:text-rose-300">{clock(s.start)}</span>
                        <span className="min-w-0">
                          {SLOT_META[s.activity.slot].emoji} {s.activity.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          <button type="button" onClick={() => openPhoto({ source: destinationSource(dest), label: dest.name, caption: "Surprise destination wallpaper" })} className="btn-ghost w-full">
            <Camera className="h-4 w-4" /> Download destination wallpaper
          </button>
        </div>
      )}
    </Sheet>
  );
}
