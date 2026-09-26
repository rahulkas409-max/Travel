"use client";

import { DESTINATION_BY_ID } from "@data/destinations";
import { OCCASION_BY_ID } from "@data/occasions";
import type { Property, SuitabilityBadge } from "@data/types";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowDownUp, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { ALL_PROPERTIES, farmsFor, regionProperties, staysFor } from "@/lib/destinations";
import { cn } from "@/lib/format";
import { FarmhouseCard } from "./FarmhouseCard";
import { ReviewDrawer } from "./ReviewDrawer";
import { StayCard, fitsBudget } from "./StayCard";

type Tab = "farm" | "stay" | "saved";
type Scope = "destination" | "region" | "india";
type Sort = "rating" | "price" | "wifi";

const BADGES: { id: SuitabilityBadge | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Ideal for Corporate Offsites", label: "💼 Offsites" },
  { id: "Couples' Private Sanctuary", label: "💞 Couples" },
  { id: "School-Safe Approved", label: "🎒 School-safe" },
  { id: "Workation Ready", label: "💻 Workation" },
  { id: "Solo & Social", label: "🤙 Social" },
];

const spring = { type: "spring", stiffness: 460, damping: 36 } as const;

export function StaysExplorer() {
  const { destination: dest, config, savedStays } = useTrip();
  const [tab, setTab] = useState<Tab>(dest.farmhouseHub ? "farm" : "stay");
  const [scope, setScope] = useState<Scope>("destination");
  const [badge, setBadge] = useState<SuitabilityBadge | "all">("all");
  const [matchOccasion, setMatchOccasion] = useState(true);
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("rating");
  const [open, setOpen] = useState<Property | null>(null);

  // Re-pick sensible defaults whenever the destination changes.
  useEffect(() => {
    const hasFarms = farmsFor(dest.id).length > 0;
    const hasStays = staysFor(dest.id).length > 0;
    setTab(dest.farmhouseHub && hasFarms ? "farm" : hasStays ? "stay" : hasFarms ? "farm" : "stay");
    setScope(hasFarms || hasStays ? "destination" : "region");
  }, [dest.id, dest.farmhouseHub]);

  const base = useMemo(() => {
    if (tab === "saved") return ALL_PROPERTIES.filter((p) => savedStays.includes(p.id));
    if (scope === "destination") return tab === "farm" ? farmsFor(dest.id) : staysFor(dest.id);
    if (scope === "region") return regionProperties(dest.region, tab);
    return ALL_PROPERTIES.filter((p) => p.collection === tab);
  }, [tab, scope, dest.id, dest.region, savedStays]);

  const list = useMemo(() => {
    const filtered = base
      .filter((p) => badge === "all" || p.badges.includes(badge))
      .filter((p) => tab === "saved" || !matchOccasion || p.occasions.includes(config.occasion))
      .filter((p) => !budgetOnly || fitsBudget(p, config.budget, config.travellers));
    return [...filtered].sort((a, b) =>
      sort === "rating" ? b.rating - a.rating || b.reviewCount - a.reviewCount : sort === "price" ? a.priceRange[0] - b.priceRange[0] : b.wifiMbps - a.wifiMbps,
    );
  }, [base, badge, matchOccasion, budgetOnly, sort, config, tab]);

  const occ = OCCASION_BY_ID[config.occasion];
  const hidden = base.length - list.length;

  return (
    <div>
      <PageHeader eyebrow="Farmhouses & Stays" title={<>Where to stay in {dest.name}</>}>
        Agro-farms, plantation bungalows, pool villas, heritage havelis and social hostels — with cleanliness, food, pool & Wi-Fi scores and traveller
        reviews. Tuned for {occ.emoji} {occ.short.toLowerCase()} trips.
      </PageHeader>

      <LayoutGroup id="stay-tabs">
        <div className="glass mb-4 inline-grid w-full grid-cols-3 gap-1 p-1 sm:w-auto" role="tablist">
          {(
            [
              { id: "farm", label: "🌾 Farmhouses & Estates" },
              { id: "stay", label: "🛏️ Hostels & Havelis" },
              { id: "saved", label: `❤️ Saved (${savedStays.length})` },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                sound.play("tick");
                setTab(t.id);
              }}
              className={cn("relative min-h-[44px] rounded-xl px-3 text-xs font-semibold sm:text-sm", tab === t.id ? "text-white" : "opacity-75")}
            >
              {tab === t.id && <motion.span layoutId="stayTab" transition={spring} className="absolute inset-0 rounded-xl bg-gradient-to-r from-sage-500 to-sage-600" />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      {tab !== "saved" && (
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-[var(--line)] p-0.5 text-xs font-semibold">
              {(
                [
                  ["destination", dest.name],
                  ["region", dest.regionName],
                  ["india", "All India"],
                ] as [Scope, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setScope(id)}
                  className={cn("max-w-[140px] truncate rounded-lg px-3 py-2 transition", scope === id ? "bg-slate-900 text-white dark:bg-white/15" : "opacity-70 hover:opacity-100")}
                >
                  {label}
                </button>
              ))}
            </div>
            <Toggle on={matchOccasion} onClick={() => setMatchOccasion((v) => !v)}>
              {occ.emoji} Best for {occ.short}
            </Toggle>
            <Toggle on={budgetOnly} onClick={() => setBudgetOnly((v) => !v)}>
              💰 Within budget
            </Toggle>
            <label className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold">
              <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border border-[var(--line)] bg-transparent px-2 py-2">
                <option value="rating">Top rated</option>
                <option value="price">Lowest price</option>
                <option value="wifi">Fastest Wi-Fi</option>
              </select>
            </label>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {BADGES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBadge(b.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  badge === b.id ? "border-marigold-500 bg-marigold-500 text-white" : "border-[var(--line)] bg-white/50 dark:bg-white/5",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="glass px-6 py-14 text-center">
          <p className="text-4xl">{tab === "saved" ? "💛" : "🏕️"}</p>
          <p className="mt-3 font-semibold">{tab === "saved" ? "No saved stays yet" : "Nothing matches these filters here"}</p>
          <p className="muted mx-auto mt-1 max-w-md text-sm">
            {tab === "saved"
              ? "Tap the heart on any stay — your shortlist is saved on this device and printed in your PDF dossier."
              : hidden > 0
                ? `${hidden} propert${hidden === 1 ? "y is" : "ies are"} hidden by your filters.`
                : `We haven't curated ${tab === "farm" ? "farmhouses" : "stays"} in ${dest.name} yet.`}
          </p>
          {tab !== "saved" && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {scope !== "india" && (
                <button type="button" className="btn-ghost" onClick={() => setScope(scope === "destination" ? "region" : "india")}>
                  Widen to {scope === "destination" ? dest.regionName : "All India"}
                </button>
              )}
              {(badge !== "all" || matchOccasion || budgetOnly) && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setBadge("all");
                    setMatchOccasion(false);
                    setBudgetOnly(false);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="muted mb-3 text-xs">
            {list.length} {tab === "farm" ? "farmhouses & estates" : tab === "saved" ? "saved" : "stays"}
            {hidden > 0 && ` · ${hidden} hidden by filters`}
            {scope !== "destination" && tab !== "saved" && " · tap a card to see which destination it's in"}
          </p>
          <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((p) => (
                <div key={p.id} className="flex flex-col">
                  {(scope !== "destination" || tab === "saved") && (
                    <p className="mb-1 ml-1 text-[11px] font-semibold uppercase tracking-wider text-rose-500">📍 {DESTINATION_BY_ID[p.destinationId]?.name}</p>
                  )}
                  {p.collection === "farm" ? <FarmhouseCard p={p} onOpen={() => setOpen(p)} /> : <StayCard p={p} onOpen={() => setOpen(p)} />}
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}

      {tab === "saved" && savedStays.length > 0 && (
        <p className="muted mt-4 flex items-center gap-1.5 text-xs">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> Saved stays for {dest.name} print with addresses & contacts in your A4 dossier.
        </p>
      )}

      <ReviewDrawer property={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        sound.play("tick", { intensity: 0.6 });
        onClick();
      }}
      aria-pressed={on}
      className={cn(
        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
        on ? "border-sage-500 bg-sage-500 text-white" : "border-[var(--line)] opacity-80 hover:opacity-100",
      )}
    >
      {children}
    </button>
  );
}
