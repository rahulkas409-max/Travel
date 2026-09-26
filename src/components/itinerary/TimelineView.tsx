"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import { AnimatePresence, LayoutGroup, motion, Reorder } from "framer-motion";
import { BedDouble, ChevronLeft, ChevronRight, Download, Mountain, Plus, RefreshCw, Sparkles, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { TierBadge } from "@/components/layout/DestinationSelector";
import { SmartImage } from "@/components/ui/SmartImage";
import { DateRange } from "@/components/ui/DateRange";
import { DestinationChip } from "@/components/ui/DestinationChip";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { zoneName } from "@/lib/destinations";
import { destinationSource } from "@/lib/imageSources";
import { WeatherCard } from "@/components/explore/WeatherCard";
import { cn, dayDate } from "@/lib/format";
import { PACE_META, analyseDay, transferWarnings } from "@/lib/itinerary";
import { ActivitySwapModal, type SwapTarget } from "./ActivitySwapModal";
import { PacingWarning, loadLabel } from "./PacingWarning";
import { SlotCard } from "./SlotCard";
import { QuoteCta } from "@/components/money/QuoteCta";
import { TransitBuffer } from "./TransitBuffer";

export function TimelineView() {
  const { destination: dest, plan, config, hydrated, setDayItems, moveItem, removeItem, regenerate, setStartDate, setDays, toast } = useTrip();
  const { openPhoto } = usePhotoViewer();
  const [dayIdx, setDayIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [target, setTarget] = useState<SwapTarget | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    if (dayIdx > plan.length - 1) setDayIdx(Math.max(0, plan.length - 1));
  }, [plan.length, dayIdx]);

  const day = plan[Math.min(dayIdx, plan.length - 1)];
  const analysis = useMemo(() => (day ? analyseDay(dest, day, config) : null), [dest, day, config]);
  const transfers = useMemo(() => transferWarnings(dest, plan), [dest, plan]);
  const dayTransfer = transfers.filter((w) => w.id === `transfer-${dayIdx}`);
  const dayLoads = useMemo(() => plan.map((d) => analyseDay(dest, d, config).load), [dest, plan, config]);
  const occ = OCCASION_BY_ID[config.occasion];

  const goDay = useCallback(
    (i: number) => {
      if (i < 0 || i >= plan.length || i === dayIdx) return;
      sound.play("flip");
      setDirection(i > dayIdx ? 1 : -1);
      setDayIdx(i);
    },
    [plan.length, dayIdx],
  );

  const focusItem = (uid: string) => {
    setHighlight(uid);
    document.querySelector(`[data-uid="${uid}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(null), 1600);
  };

  if (!day || !analysis) return null;

  return (
    <div className="space-y-6">
      {/* ───── Destination hero ───── */}
      <section className="relative overflow-hidden rounded-3xl shadow-card">
        <SmartImage source={destinationSource(dest)} width={1600} priority className="h-64 w-full sm:h-80">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
        </SmartImage>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-center gap-1.5">
            <TierBadge tier={dest.tier} className="!bg-white/20 !text-white backdrop-blur" />
            <span className="pill bg-white/20 backdrop-blur">
              <Mountain className="h-3 w-3" /> {dest.elevation.toLocaleString("en-IN")} m
            </span>
            <span className="pill bg-white/20 backdrop-blur">🗓 {dest.idealMonths}</span>
          </div>
          <motion.h1 key={dest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl font-bold leading-none sm:text-5xl">
            {dest.name}
          </motion.h1>
          <p className="mt-1.5 max-w-xl text-sm text-white/85 sm:text-base">{dest.tagline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DestinationChip light />
            <WeatherCard destinationId={dest.id} name={dest.name} compact />
            <Link href={`/destinations/${dest.id}`} className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/30">
              Destination guide →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dest.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full border border-white/30 px-2.5 py-0.5 text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openPhoto({ source: destinationSource(dest), label: dest.name, caption: dest.tagline })}
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/60"
        >
          <Download className="h-3.5 w-3.5" /> Wallpaper
        </button>
      </section>

      {/* ───── Trip toolbar ───── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">
            {occ.emoji} {occ.label} · {PACE_META[config.pace].label} pace
          </p>
          <h2 className="section-title mt-1">Your {config.days}-day plan</h2>
          <p className="muted mt-1 text-sm">{occ.tagline}. Drag ⋮⋮ or use the arrows to reorder — times update automatically.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRange
            variant="pill"
            start={config.startDate}
            length={config.days}
            onChange={(st, len) => {
              if (st !== config.startDate) setStartDate(st);
              if (len !== config.days) setDays(len);
            }}
          />
          <button
            type="button"
            className="btn-ghost !px-3"
            onClick={() => {
              sound.play("whoosh");
              regenerate();
              toast("✨ Fresh plan generated");
            }}
          >
            <RefreshCw className="h-4 w-4" /> Re-roll plan
          </button>
        </div>
      </section>

      {/* ───── Day tabs ───── */}
      <LayoutGroup id="day-tabs">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {plan.map((d, i) => {
            const active = i === dayIdx;
            const l = loadLabel(dayLoads[i] ?? 0);
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => goDay(i)}
                className={cn("relative shrink-0 rounded-2xl px-4 py-2.5 text-left transition", active ? "text-white" : "glass hover:bg-white")}
                aria-pressed={active}
              >
                {active && <motion.span layoutId="dayPill" className="absolute inset-0 rounded-2xl bg-slate-900 shadow-lg dark:bg-white/15" transition={{ type: "spring", stiffness: 450, damping: 36 }} />}
                <span className="relative block text-sm font-bold">Day {d.day}</span>
                <span className={cn("relative block text-[11px]", active ? "text-white/75" : "muted")}>
                  {dayDate(config.startDate, i) ?? zoneName(dest, d.stayZone)}
                </span>
                <span className={cn("relative mt-1 block text-[10px] font-semibold", active ? "text-marigold-300" : l.tone)}>● {l.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ───── Timeline ───── */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">
              Day {day.day} · base: <span className="text-rose-600 dark:text-rose-300">{zoneName(dest, day.stayZone)}</span>
            </p>
            <div className="flex gap-1">
              <button type="button" className="icon-btn !h-9 !w-9" onClick={() => goDay(dayIdx - 1)} disabled={dayIdx === 0} aria-label="Previous day">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" className="icon-btn !h-9 !w-9" onClick={() => goDay(dayIdx + 1)} disabled={dayIdx === plan.length - 1} aria-label="Next day">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${dest.id}-${config.occasion}-${config.pace}-${day.day}-${config.seed}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {day.items.length === 0 ? (
                <div className="glass py-12 text-center">
                  <p className="text-3xl">🌤️</p>
                  <p className="mt-2 font-semibold">A completely free day</p>
                  <p className="muted text-sm">Add a stop below, or keep it as a rest day.</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={day.items} onReorder={(items) => setDayItems(dayIdx, items)} className="space-y-1" as="ol">
                  {analysis.schedule.map((s, i) => (
                    <SlotCard
                      key={s.item.uid}
                      s={s}
                      index={i}
                      count={analysis.schedule.length}
                      zoneLabel={zoneName(dest, s.activity.zone)}
                      dest={dest}
                      occasion={config.occasion}
                      warnings={analysis.warnings.filter((w) => w.itemUid === s.item.uid)}
                      highlighted={highlight === s.item.uid}
                      before={<TransitBuffer s={s} />}
                      onSwap={() => {
                        sound.play("pop");
                        setTarget({ mode: "swap", dayIdx, itemIdx: i });
                      }}
                      onRemove={() => {
                        sound.play("whoosh");
                        removeItem(dayIdx, i);
                      }}
                      onMove={(dir) => {
                        sound.play("tick");
                        moveItem(dayIdx, i, i + dir);
                      }}
                    />
                  ))}
                </Reorder.Group>
              )}
              <button
                type="button"
                onClick={() => {
                  sound.play("pop");
                  setTarget({ mode: "add", dayIdx });
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--line)] py-4 text-sm font-semibold opacity-80 transition hover:border-marigold-500 hover:opacity-100"
              >
                <Plus className="h-4 w-4" /> Add a stop to Day {day.day}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ───── Sidebar ───── */}
        <aside className="space-y-4 lg:sticky lg:top-44 lg:self-start">
          <PacingWarning analysis={analysis} extra={dayTransfer} onFocusItem={focusItem} />
          <QuoteCta source="itinerary-sidebar" destinationId={dest.id} />
          <div className="glass p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-marigold-500" /> Tuned for {occ.short}
            </p>
            <ul className="muted mt-2 space-y-1 text-xs">
              {occ.priorities.map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
            </ul>
            <p className="muted mt-3 text-xs">
              <span className="font-semibold text-[var(--ink)]">Stay tip:</span> {occ.stayHint}.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/stays" className="btn-ghost !min-h-[40px] !text-xs">
                <BedDouble className="h-4 w-4" /> Stays
              </Link>
              <Link href="/food" className="btn-ghost !min-h-[40px] !text-xs">
                <UtensilsCrossed className="h-4 w-4" /> Food
              </Link>
            </div>
          </div>
          {!hydrated && <p className="muted text-center text-xs">Loading your saved trip…</p>}
        </aside>
      </div>

      <ActivitySwapModal target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
