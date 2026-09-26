"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import type { Occasion } from "@data/types";
import { motion, useDragControls, Reorder } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowUp, Camera, Clock, GripVertical, IndianRupee, Lightbulb, MapPin, Shuffle, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { SmartImage } from "@/components/ui/SmartImage";
import { sound } from "@/lib/audio";
import { cn, clock, duration, inr } from "@/lib/format";
import { SLOT_META, type PacingWarning, type ScheduledItem } from "@/lib/itinerary";

const SLOT_TONE = {
  morning: "from-marigold-400 to-marigold-500",
  afternoon: "from-marigold-500 to-rose-400",
  sunset: "from-rose-400 to-rose-600",
  night: "from-slate-700 to-slate-950",
} as const;

interface Props {
  s: ScheduledItem;
  index: number;
  count: number;
  zoneLabel: string;
  occasion: Occasion;
  warnings: PacingWarning[];
  highlighted: boolean;
  onSwap: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  /** Transit buffer rendered above the card (travels with it while dragging). */
  before?: React.ReactNode;
}

/** A single draggable time-slot card on the day timeline. */
export function SlotCard({ s, index, count, zoneLabel, occasion, warnings, highlighted, onSwap, onRemove, onMove, before }: Props) {
  const controls = useDragControls();
  const { openPhoto } = usePhotoViewer();
  const [tipOpen, setTipOpen] = useState(false);
  const a = s.activity;
  const matches = a.occasions.includes(occasion);
  const imageKey = `kind-${a.kind}`;
  const worst = warnings.find((w) => w.level === "danger") ?? warnings.find((w) => w.level === "warn");

  return (
    <Reorder.Item
      value={s.item}
      id={s.item.uid}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => sound.play("flip")}
      onDragEnd={() => sound.play("tick")}
      className="relative list-none"
      whileDrag={{ scale: 1.02, zIndex: 20, boxShadow: "0 20px 50px -15px rgba(0,0,0,0.35)" }}
      layout="position"
    >
      {before}
      <motion.article
        data-uid={s.item.uid}
        animate={highlighted ? { scale: [1, 1.015, 1] } : {}}
        className={cn("glass overflow-hidden", highlighted && "ring-2 ring-rose-500")}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-56 sm:shrink-0 md:w-64">
            <SmartImage imageKey={imageKey} label={a.name} seed={a.id} width={640} className="aspect-[16/9] w-full sm:aspect-auto sm:h-full sm:min-h-[180px]" />
            <div className={cn("absolute left-3 top-3 rounded-xl bg-gradient-to-br px-2.5 py-1.5 text-white shadow-lg", SLOT_TONE[a.slot])}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                {SLOT_META[a.slot].emoji} {SLOT_META[a.slot].label}
              </p>
              <p className="text-base font-extrabold leading-none tabular-nums">{clock(s.start)}</p>
            </div>
            <button
              type="button"
              onClick={() => openPhoto({ imageKey, label: a.name, seed: a.id, caption: `${zoneLabel} · ${SLOT_META[a.slot].label}` })}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/70"
            >
              <Camera className="h-3.5 w-3.5" /> Save Image
            </button>
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  controls.start(e);
                }}
                className="-ml-1 mt-0.5 flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md opacity-40 hover:opacity-80 active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold leading-snug">{a.name}</h3>
                <div className="muted mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {duration(a.durationMins)} · till {clock(s.end)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {zoneLabel}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <IndianRupee className="h-3.5 w-3.5" /> {a.cost ? `${inr(a.cost).slice(1)} pp` : "Free"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {matches && (
                <span className="pill bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300">
                  {OCCASION_BY_ID[occasion].emoji} {OCCASION_BY_ID[occasion].short} pick
                </span>
              )}
              {a.generic && <span className="pill bg-black/5 text-[var(--ink-soft)] dark:bg-white/10">Flexible idea</span>}
              {worst && (
                <span className={cn("pill", worst.level === "danger" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" : "bg-marigold-100 text-marigold-700 dark:bg-marigold-500/15 dark:text-marigold-300")}>
                  <AlertTriangle className="h-3 w-3" /> {worst.title.split(":")[0]}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setTipOpen((o) => !o)}
              className="mt-3 flex gap-2 rounded-xl border border-dashed border-marigold-400/60 bg-marigold-50/70 p-2.5 text-left text-[13px] leading-snug text-stone-700 dark:bg-marigold-500/[0.07] dark:text-stone-200"
              aria-expanded={tipOpen}
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-marigold-600" />
              <span className={cn(!tipOpen && "line-clamp-2")}>
                <span className="hand mr-1 text-sm font-bold text-rose-600 dark:text-rose-300">Insider tip:</span>
                {a.tip}
              </span>
            </button>

            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--line)] pt-3">
              <button type="button" onClick={onSwap} className="btn-ghost !min-h-[38px] !rounded-full !px-3 !text-xs">
                <Shuffle className="h-3.5 w-3.5" /> Swap activity
              </button>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="icon-btn !h-9 !w-9 disabled:opacity-30" aria-label="Move earlier">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="icon-btn !h-9 !w-9 disabled:opacity-30" aria-label="Move later">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={onRemove} className="icon-btn !h-9 !w-9 hover:!text-rose-600" aria-label="Remove from day">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </Reorder.Item>
  );
}
