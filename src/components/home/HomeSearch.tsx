"use client";

import { OCCASIONS } from "@data/occasions";
import type { Occasion } from "@data/types";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { BedDouble, CalendarRange, ChevronDown, Dices, Minus, Plus, Search, Sprout, TrainFront, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { DateRange } from "@/components/ui/DateRange";
import { DestinationPicker } from "@/components/layout/DestinationSelector";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { getDestination } from "@/lib/destinations";
import { cn } from "@/lib/format";

type Service = "plan" | "farm" | "stay" | "surprise" | "food" | "transit";

const SERVICES: { id: Service; label: string; icon: typeof Search }[] = [
  { id: "plan", label: "Trip Planner", icon: CalendarRange },
  { id: "farm", label: "Farmhouses", icon: Sprout },
  { id: "stay", label: "Stays", icon: BedDouble },
  { id: "surprise", label: "Surprise Me", icon: Dices },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "transit", label: "Transit", icon: TrainFront },
];

const CTA: Record<Service, string> = {
  plan: "PLAN MY TRIP",
  farm: "FIND FARMHOUSES",
  stay: "SEARCH STAYS",
  surprise: "SPIN THE WHEEL",
  food: "SHOW FOOD RADAR",
  transit: "SHOW TRANSIT GUIDE",
};

function inThreeWeeks() {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

/** MakeMyTrip/Goibibo-style search card: service tabs, trip-type radios, big field boxes, pill CTA. */
export function HomeSearch() {
  const router = useRouter();
  const { config, hydrated, applyTrip } = useTrip();
  const [service, setService] = useState<Service>("plan");
  const [destId, setDestId] = useState(config.destinationId);
  const [occasion, setOccasion] = useState<Occasion>(config.occasion);
  const [start, setStart] = useState(config.startDate || "");
  const [days, setDays] = useState(config.days);
  const [people, setPeople] = useState(config.travellers);
  const [picker, setPicker] = useState(false);

  // Adopt the saved trip once LocalStorage has loaded.
  useEffect(() => {
    if (!hydrated) return;
    setDestId(config.destinationId);
    setOccasion(config.occasion);
    setStart(config.startDate || inThreeWeeks());
    setDays(config.days);
    setPeople(config.travellers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const dest = getDestination(destId);
  const showTripFields = service === "plan" || service === "farm" || service === "stay" || service === "transit";
  const showOccasion = service === "plan" || service === "farm" || service === "stay";

  const go = () => {
    sound.unlock();
    sound.play("whoosh");
    if (service === "surprise") return router.push("/roulette");
    applyTrip({ destinationId: destId, occasion, days, travellers: people, startDate: start });
    const to: Record<Service, string> = {
      plan: "/itinerary",
      farm: "/stays?tab=farm",
      stay: "/stays?tab=stay",
      surprise: "/roulette",
      food: "/food",
      transit: "/transit",
    };
    router.push(to[service]);
  };

  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="glass-strong !rounded-[1.75rem] px-3 pb-12 pt-2 shadow-2xl sm:px-6">
        {/* Service tabs */}
        <LayoutGroup id="service-tabs">
          <div role="tablist" className="no-scrollbar -mx-3 flex gap-1 overflow-x-auto border-b border-[var(--line)] px-3 sm:mx-0 sm:justify-center sm:px-0">
            {SERVICES.map((s) => {
              const active = s.id === service;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    sound.play("tick", { intensity: 0.6 });
                    setService(s.id);
                  }}
                  className={cn("relative flex min-w-[76px] shrink-0 flex-col items-center gap-1 px-3 pb-3 pt-2 text-xs font-semibold transition sm:min-w-[96px]", active ? "text-rose-700 dark:text-rose-300" : "opacity-70 hover:opacity-100")}
                >
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl transition", active ? "bg-gradient-to-br from-marigold-400 to-rose-500 text-white shadow-lift" : "bg-black/[0.04] dark:bg-white/10")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  {s.label}
                  {active && <motion.span layoutId="serviceTab" className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-rose-500" />}
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Trip type radios (like One-way / Round-trip) */}
        {showOccasion && (
          <div className="no-scrollbar -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  sound.play("tick", { intensity: 0.5 });
                  setOccasion(o.id);
                }}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition",
                  occasion === o.id ? "bg-rose-50 text-rose-700 ring-1 ring-rose-400 dark:bg-rose-500/15 dark:text-rose-200" : "hover:bg-black/[0.04] dark:hover:bg-white/5",
                )}
                aria-pressed={occasion === o.id}
              >
                <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border-2", occasion === o.id ? "border-rose-500" : "border-stone-400")}>
                  {occasion === o.id && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                </span>
                {o.emoji} {o.short}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={service} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {service === "surprise" ? (
              <div className="mt-4 rounded-2xl border border-[var(--line)] p-5 text-center sm:text-left">
                <p className="font-display text-2xl font-bold">Can&apos;t decide where to go? 🎲</p>
                <p className="muted mt-1 text-sm">Answer 4 vibe questions — we match all 68 destinations and spin a weighted wheel for your surprise trip.</p>
              </div>
            ) : (
              <div className={cn("mt-4 grid overflow-hidden rounded-2xl border border-[var(--line)]", showTripFields ? "grid-cols-1 lg:grid-cols-[1.25fr_2fr_1fr]" : "grid-cols-1")}>
                <Field label="Where to" className={cn(showTripFields && "border-b lg:border-b-0 lg:border-r")} onClick={() => setPicker(true)}>
                  <p className="truncate text-[1.6rem] font-extrabold leading-tight">{dest.name}</p>
                  <p className="muted truncate text-xs">
                    {dest.state} · {dest.regionName}
                  </p>
                </Field>
                {showTripFields && (
                  <>
                    <DateRange
                      className="border-b border-[var(--line)] lg:border-b-0 lg:border-r"
                      start={start}
                      length={days}
                      unit={service === "farm" || service === "stay" ? "nights" : "days"}
                      labels={service === "transit" ? ["Departure", "Return"] : undefined}
                      onChange={(st, len) => {
                        setStart(st);
                        setDays(len);
                      }}
                    />
                    <Field label="Travellers">
                      <Counter value={people} min={1} max={200} onChange={setPeople} suffix={people > 1 ? "people" : "person"} />
                    </Field>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 -bottom-7 flex justify-center">
        <motion.button
          type="button"
          onClick={go}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-marigold-500 via-rose-500 to-rose-600 px-10 text-lg font-extrabold tracking-wide text-white shadow-[0_18px_40px_-12px_rgba(224,109,83,0.75)] sm:px-16"
        >
          <Search className="h-5 w-5" strokeWidth={3} /> {CTA[service]}
        </motion.button>
      </div>

      <DestinationPicker
        open={picker}
        onClose={() => setPicker(false)}
        currentId={destId}
        onSelect={(id) => {
          sound.play("flip");
          setDestId(id);
          const d = getDestination(id);
          setDays((n) => Math.min(Math.max(n, d.idealDays[0]), Math.max(d.idealDays[1], 2)));
          setPicker(false);
        }}
      />
    </div>
  );
}

function Field({ label, children, className, onClick }: { label: string; children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn("relative min-w-0 border-[var(--line)] px-4 py-3 text-left transition", onClick && "hover:bg-marigold-50/60 dark:hover:bg-white/5", className)}
    >
      <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider opacity-60">
        {label} {onClick && <ChevronDown className="h-3 w-3" />}
      </p>
      <div className="mt-0.5">{children}</div>
    </Tag>
  );
}

function Counter({ value, min, max, onChange, suffix }: { value: number; min: number; max: number; onChange: (n: number) => void; suffix?: string }) {
  const step = (d: number) => {
    const n = Math.min(max, Math.max(min, value + d));
    if (n !== value) {
      sound.play("tick");
      onChange(n);
    }
  };
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => step(-1)} disabled={value <= min} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] disabled:opacity-30" aria-label="Decrease">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2ch] text-center text-[1.6rem] font-extrabold tabular-nums">{value}</span>
      <button type="button" onClick={() => step(1)} disabled={value >= max} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] disabled:opacity-30" aria-label="Increase">
        <Plus className="h-3.5 w-3.5" />
      </button>
      {suffix && <span className="muted text-xs">{suffix}</span>}
    </div>
  );
}
