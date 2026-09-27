"use client";

import { OCCASIONS } from "@data/occasions";
import type { Pace } from "@data/types";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { CalendarDays, Minus, Plus, SlidersHorizontal, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";
import { PACE_META } from "@/lib/itinerary";

const PACES: Pace[] = ["relaxed", "balanced", "packed"];
const spring = { type: "spring", stiffness: 500, damping: 38, mass: 0.8 } as const;

export function budgetTierLabel(b: number): { label: string; tone: string } {
  if (b < 2000) return { label: "Backpacker", tone: "text-sage-700 dark:text-sage-300" };
  if (b <= 6000) return { label: "Boutique Comfort", tone: "text-marigold-600 dark:text-marigold-400" };
  return { label: "Luxury Heritage", tone: "text-rose-700 dark:text-rose-300" };
}

/**
 * "The Vibe Bar" — floating, tactile control strip for occasion, budget,
 * pace, days and group size. The active occasion is tracked by a spring-driven
 * moving pill (`layoutId="activeTab"`).
 */
export function FloatingOccasionBar() {
  const { config, setOccasion, setBudget, setPace, setDays, setTravellers } = useTrip();
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(config.budget);

  useEffect(() => setBudgetDraft(config.budget), [config.budget]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCompact(window.scrollY > 90));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const tier = budgetTierLabel(budgetDraft);
  const pct = ((budgetDraft - 1000) / (20000 - 1000)) * 100;

  return (
    <div className="no-print sticky z-40 px-3 sm:px-6" style={{ top: "calc(4.25rem + var(--safe-top))" }}>
      <motion.div layout transition={spring} className="glass-strong mx-auto max-w-5xl overflow-hidden !rounded-[1.4rem] p-1.5">
        <div className="flex items-center gap-1.5">
          <LayoutGroup id="occasion-bar">
            <div role="tablist" aria-label="Trip occasion" className="relative grid flex-1 grid-cols-4 gap-1">
              {OCCASIONS.map((o) => {
                const active = config.occasion === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      sound.unlock();
                      sound.play("tick");
                      setOccasion(o.id);
                    }}
                    className={cn(
                      "relative flex min-h-[44px] flex-col items-center justify-center rounded-2xl px-1 text-center transition-colors sm:flex-row sm:gap-1.5",
                      active ? "text-white" : "text-[var(--ink)] hover:bg-black/[0.04] dark:hover:bg-white/5",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeTab"
                        transition={spring}
                        className="absolute inset-0 rounded-2xl shadow-lift"
                        style={{ background: `linear-gradient(135deg, ${o.accentHex}, #f59e0b)` }}
                      />
                    )}
                    <span className={cn("relative text-lg leading-none transition-transform", active && "scale-110")}>{o.emoji}</span>
                    <span className={cn("relative mt-0.5 text-[10.5px] font-semibold leading-tight sm:mt-0 sm:text-sm", compact && "max-sm:hidden")}>
                      {o.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          <button
            type="button"
            onClick={() => {
              sound.play("pop");
              setExpanded((e) => !e);
            }}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition",
              expanded ? "bg-slate-900 text-white dark:bg-sand-100 dark:text-slate-900" : "bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/10",
            )}
            aria-expanded={expanded}
            aria-label="Budget, pace and group settings"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {!expanded && !compact && (
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-1 pb-0.5 pt-1.5 text-[11px] font-medium">
            <Chip onClick={() => setExpanded(true)}>💰 {inr(config.budget)}/day</Chip>
            <Chip onClick={() => setExpanded(true)}>
              {PACE_META[config.pace].emoji} {PACE_META[config.pace].label}
            </Chip>
            <Chip onClick={() => setExpanded(true)}>📅 {config.days} days</Chip>
            <Chip onClick={() => setExpanded(true)}>👥 {config.travellers}</Chip>
          </div>
        )}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 px-2 pb-2 pt-3 md:grid-cols-[1.4fr_1fr_auto]">
                {/* Budget slider */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="budget" className="text-xs font-bold uppercase tracking-wider opacity-70">
                      Daily budget / person
                    </label>
                    <span className="text-sm font-semibold tabular-nums">
                      {inr(budgetDraft)} <span className={cn("text-xs", tier.tone)}>· {tier.label}</span>
                    </span>
                  </div>
                  <div className="relative mt-2 h-8">
                    <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sage-400 via-marigold-400 to-rose-500 opacity-30" />
                    <div
                      className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sage-500 via-marigold-500 to-rose-500"
                      style={{ width: `${pct}%` }}
                    />
                    <input
                      id="budget"
                      type="range"
                      min={1000}
                      max={20000}
                      step={500}
                      value={budgetDraft}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Math.floor(v / 2500) !== Math.floor(budgetDraft / 2500)) sound.play("tick", { intensity: 0.6 });
                        setBudgetDraft(v);
                      }}
                      onPointerUp={() => setBudget(budgetDraft)}
                      onKeyUp={() => setBudget(budgetDraft)}
                      onBlur={() => setBudget(budgetDraft)}
                      className="relative h-8 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-lg"
                      aria-valuetext={`${inr(budgetDraft)} per day, ${tier.label}`}
                    />
                  </div>
                  <div className="muted flex justify-between text-[10px]">
                    <span>₹1k</span>
                    <span>₹5k</span>
                    <span>₹10k</span>
                    <span>₹20k</span>
                  </div>
                </div>

                {/* Pace */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">Pacing</p>
                  <LayoutGroup id="pace-bar">
                    <div className="relative mt-2 grid grid-cols-3 gap-1 rounded-2xl bg-black/[0.04] p-1 dark:bg-white/5">
                      {PACES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            sound.play("tick");
                            setPace(p);
                          }}
                          className={cn("relative min-h-[40px] rounded-xl text-xs font-semibold", config.pace === p ? "text-slate-900 dark:text-white" : "opacity-70")}
                          aria-pressed={config.pace === p}
                        >
                          {config.pace === p && (
                            <motion.span layoutId="activePace" transition={spring} className="absolute inset-0 rounded-xl bg-white shadow dark:bg-white/15" />
                          )}
                          <span className="relative">
                            {PACE_META[p].emoji} {PACE_META[p].label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </LayoutGroup>
                  <p className="muted mt-1.5 text-[11px]">{PACE_META[config.pace].blurb}</p>
                </div>

                {/* Steppers */}
                <div className="flex gap-3 md:flex-col md:gap-2">
                  <Stepper icon={<CalendarDays className="h-4 w-4" />} label="Days" value={config.days} min={1} max={10} onChange={setDays} />
                  <Stepper icon={<Users className="h-4 w-4" />} label="People" value={config.travellers} min={1} max={200} onChange={setTravellers} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Chip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 rounded-full bg-black/[0.04] px-2.5 py-1 transition hover:bg-black/[0.08] dark:bg-white/[0.06]">
      {children}
    </button>
  );
}

function Stepper({
  icon,
  label,
  value,
  min,
  max,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const step = (d: number) => {
    const n = Math.min(max, Math.max(min, value + d));
    if (n !== value) {
      sound.play("tick");
      onChange(n);
    }
  };
  return (
    <div className="flex flex-1 items-center gap-2 rounded-2xl bg-black/[0.04] p-1 pl-2.5 dark:bg-white/5">
      <span className="opacity-60">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
      <div className="ml-auto flex items-center">
        <button type="button" onClick={() => step(-1)} disabled={value <= min} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white disabled:opacity-30 dark:hover:bg-white/10" aria-label={`Fewer ${label}`}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-7 text-center text-sm font-bold tabular-nums">
          {value}
        </motion.span>
        <button type="button" onClick={() => step(1)} disabled={value >= max} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white disabled:opacity-30 dark:hover:bg-white/10" aria-label={`More ${label}`}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
