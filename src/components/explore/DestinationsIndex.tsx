"use client";

import { COLLECTIONS, COLLECTION_BY_ID } from "@data/collections";
import { REGIONS, TIER_LABEL } from "@data/regions";
import type { Region, Tier } from "@data/types";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { searchDestinations } from "@/lib/destinations";
import { cn } from "@/lib/format";
import { DestinationCard } from "./DestinationCard";

export function DestinationsIndex() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const collection = params.get("c") ?? "";
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">((params.get("r") as Region) || "all");
  const [tier, setTier] = useState<Tier | 0>(0);

  const setCollection = (c: string) => {
    const sp = new URLSearchParams(params.toString());
    if (c) sp.set("c", c);
    else sp.delete("c");
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const list = useMemo(() => {
    const col = COLLECTION_BY_ID[collection];
    return searchDestinations(query, region).filter((d) => (tier === 0 || d.tier === tier) && (!col || col.match(d)));
  }, [query, region, tier, collection]);

  const active = COLLECTION_BY_ID[collection];

  return (
    <div>
      <PageHeader eyebrow="Destinations" title={active ? `${active.emoji} ${active.title}` : "Explore India"}>
        {active ? active.subtitle : "68 places across six regions — metros, classics and off-beat Tier 3 escapes. Every page has live photos, weather and a ready itinerary."}
      </PageHeader>

      <div className="glass-strong sticky top-[4.6rem] z-30 mb-6 space-y-3 p-3 sm:top-[5rem]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by place, state or vibe — “tea”, “fort”, “snow”, “farmhouse”"
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white/80 pl-10 pr-10 text-base outline-none ring-marigold-500/40 focus:ring-4 dark:bg-white/5"
            aria-label="Search destinations"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-black/5" aria-label="Clear">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <LayoutGroup id="dest-regions">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {[{ id: "all" as const, short: "All India", emoji: "🇮🇳" }, ...REGIONS].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegion(r.id)}
                className={cn("relative shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold", region === r.id ? "text-white" : "bg-black/[0.04] dark:bg-white/5")}
              >
                {region === r.id && <motion.span layoutId="destRegion" className="absolute inset-0 rounded-full bg-gradient-to-r from-marigold-500 to-rose-500" />}
                <span className="relative">
                  {r.emoji} {r.short}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto text-xs">
          {([0, 1, 2, 3] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 font-semibold", tier === t ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" : "border-[var(--line)] opacity-80")}
            >
              {t === 0 ? "All tiers" : TIER_LABEL[t]}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-[var(--line)]" />
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCollection(collection === c.id ? "" : c.id)}
              className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 font-semibold", collection === c.id ? "border-sage-500 bg-sage-500 text-white" : "border-[var(--line)] opacity-80")}
            >
              {c.emoji} {c.title}
            </button>
          ))}
        </div>
      </div>

      <p className="muted mb-3 text-sm">
        {list.length} destination{list.length === 1 ? "" : "s"}
      </p>
      {list.length === 0 ? (
        <div className="glass py-14 text-center">
          <p className="text-4xl">🧭</p>
          <p className="mt-2 font-semibold">No destinations match</p>
          <button
            type="button"
            className="btn-ghost mt-4"
            onClick={() => {
              setQuery("");
              setRegion("all");
              setTier(0);
              setCollection("");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((d) => (
              <motion.div key={d.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                <DestinationCard d={d} className="w-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
