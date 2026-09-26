"use client";

import { REGIONS, TIER_LABEL } from "@data/regions";
import type { Destination, Region, Tier } from "@data/types";
import { motion } from "framer-motion";
import { ChevronDown, MapPin, Mountain, Search, Sprout, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { groupDirectory, searchDestinations } from "@/lib/destinations";
import { cn } from "@/lib/format";

const TIER_TONE: Record<Tier, string> = {
  1: "bg-slate-900/80 text-sand-100 dark:bg-sand-100/90 dark:text-slate-900",
  2: "bg-marigold-100 text-marigold-700 dark:bg-marigold-500/20 dark:text-marigold-400",
  3: "bg-sage-100 text-sage-700 dark:bg-sage-500/20 dark:text-sage-300",
};

export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  return <span className={cn("pill !px-2 !py-0.5 !text-[10px]", TIER_TONE[tier], className)}>{TIER_LABEL[tier]}</span>;
}

/** Header trigger + searchable, region → tier grouped combobox. */
export function DestinationSelector({ compact = false }: { compact?: boolean }) {
  const { destination, setDestination } = useTrip();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          sound.play("pop");
          setOpen(true);
        }}
        className={cn(
          "group flex min-h-[44px] min-w-0 items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 py-1.5 pl-2 pr-3 text-left shadow-sm backdrop-blur transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10",
          compact ? "max-w-[190px]" : "max-w-[320px]",
        )}
        aria-haspopup="dialog"
        aria-label={`Destination: ${destination.name}. Change destination`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-marigold-500 to-rose-500 text-white">
          <MapPin className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{destination.name}</span>
          <span className="muted block truncate text-[11px] leading-tight">
            {destination.state} · {destination.regionName}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60 transition group-hover:translate-y-0.5" />
      </button>
      <DestinationPicker
        open={open}
        onClose={() => setOpen(false)}
        currentId={destination.id}
        onSelect={(id) => {
          sound.play("flip");
          setDestination(id);
          setOpen(false);
        }}
      />
    </>
  );
}

export function DestinationPicker({
  open,
  onClose,
  currentId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  currentId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const [tier, setTier] = useState<Tier | 0>(0);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = useMemo(
    () => searchDestinations(query, region).filter((d) => tier === 0 || d.tier === tier),
    [query, region, tier],
  );
  const groups = useMemo(() => groupDirectory(results), [results]);
  const flat = useMemo(() => groups.flatMap((g) => g.tiers.flatMap((t) => t.items)), [groups]);

  useEffect(() => setActive(0), [query, region, tier]);
  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(flat.length - 1, a + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === "Enter" && flat[active]) {
        e.preventDefault();
        onSelect(flat[active].id);
      }
    },
    [flat, active, onSelect],
  );

  let idx = -1;

  return (
    <Sheet open={open} onClose={onClose} title="Where to?" subtitle={`${flat.length} destinations across India`} size="xl">
      <div className="sticky -top-4 z-10 -mx-5 -mt-4 space-y-3 bg-[rgb(var(--bg-rgb)/0.90)] px-5 pb-3 pt-4 backdrop-blur-md">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={flat[active] ? `${listId}-${flat[active].id}` : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search city, state, vibe — try “farmhouse”, “tea”, “snow”"
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white/80 pl-10 pr-10 text-base outline-none ring-marigold-500/40 focus:ring-4 dark:bg-white/5"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-black/5" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {[{ id: "all" as const, short: "All India", emoji: "🇮🇳" }, ...REGIONS].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegion(r.id)}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition",
                region === r.id ? "text-white" : "bg-white/70 hover:bg-white dark:bg-white/5",
              )}
            >
              {region === r.id && (
                <motion.span layoutId="regionPill" className="absolute inset-0 rounded-full bg-gradient-to-r from-marigold-500 to-rose-500" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              <span className="relative">
                {r.emoji} {r.short}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 text-xs">
          {([0, 1, 2, 3] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 font-semibold transition",
                tier === t ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" : "border-[var(--line)] opacity-80 hover:opacity-100",
              )}
            >
              {t === 0 ? "All tiers" : TIER_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label="Destinations" className="space-y-6 pb-4">
        {groups.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-3xl">🧭</p>
            <p className="mt-2 font-semibold">No match for “{query}”</p>
            <p className="muted text-sm">Try a state name, “beach”, “fort” or “offbeat”.</p>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.region}>
            <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
              <span>{g.emoji}</span> {g.regionName}
            </h3>
            <div className="space-y-3">
              {g.tiers.map((t) => (
                <div key={t.tier}>
                  <p className="muted mb-1.5 text-[11px] font-bold uppercase tracking-widest">{TIER_LABEL[t.tier]}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {t.items.map((d) => {
                      idx += 1;
                      const i = idx;
                      return (
                        <DestinationOption
                          key={d.id}
                          id={`${listId}-${d.id}`}
                          idx={i}
                          d={d}
                          selected={d.id === currentId}
                          active={i === active}
                          onHover={() => setActive(i)}
                          onSelect={() => onSelect(d.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Sheet>
  );
}

function DestinationOption({
  d,
  id,
  idx,
  selected,
  active,
  onHover,
  onSelect,
}: {
  d: Destination;
  id: string;
  idx: number;
  selected: boolean;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      id={id}
      data-idx={idx}
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-2xl border p-2 pr-3 transition",
        active ? "border-marigold-500/70 bg-marigold-50/80 dark:bg-marigold-500/10" : "border-[var(--line)] bg-white/60 dark:bg-white/[0.03]",
        selected && "ring-2 ring-rose-500/60",
      )}
    >
      <SmartImage imageKey={d.imageKey} label={d.name} seed={d.id} width={200} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold">{d.name}</p>
          {d.farmhouseHub && <Sprout className="h-3.5 w-3.5 shrink-0 text-sage-500" aria-label="Farmhouse hub" />}
        </div>
        <p className="muted truncate text-xs">{d.aka ?? d.tagline}</p>
        <p className="muted mt-0.5 flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-0.5">
            <Mountain className="h-3 w-3" /> {d.elevation.toLocaleString("en-IN")} m
          </span>
          <span>· {d.idealMonths.split("·")[0].trim()}</span>
        </p>
      </div>
    </div>
  );
}
