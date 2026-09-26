"use client";

import type { EaterySpotType } from "@data/types";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Clock, Flame, Leaf, MapPin, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { foodFor } from "@/lib/destinations";
import { cn, inr } from "@/lib/format";

const TYPES: (EaterySpotType | "All")[] = ["All", "Legendary", "Street Lane", "Dhaba", "Cafe", "Fine Local"];
const TYPE_EMOJI: Record<EaterySpotType, string> = { Legendary: "🏆", "Street Lane": "🛺", Dhaba: "🍛", Cafe: "☕", "Fine Local": "🍽️" };

function VegDot({ veg }: { veg: boolean }) {
  return (
    <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded-[3px] border-2", veg ? "border-green-600" : "border-red-700")} title={veg ? "Vegetarian" : "Non-vegetarian"}>
      <span className={cn("h-1.5 w-1.5 rounded-full", veg ? "bg-green-600" : "bg-red-700")} />
    </span>
  );
}

export function FoodRadar() {
  const { destination: dest } = useTrip();
  const { openPhoto } = usePhotoViewer();
  const guide = useMemo(() => foodFor(dest), [dest]);
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [vegOnly, setVegOnly] = useState(false);

  const dishes = guide.dishes.filter((d) => !vegOnly || d.veg);
  const spots = guide.spots.filter((s) => (type === "All" || s.type === type) && (!vegOnly || s.veg !== "non-veg"));

  return (
    <div>
      <PageHeader
        eyebrow="Local Food & Radar"
        title={<>What to eat in {dest.name}</>}
        actions={
          <button
            type="button"
            onClick={() => {
              sound.play("tick");
              setVegOnly((v) => !v);
            }}
            aria-pressed={vegOnly}
            className={cn("btn !min-h-[40px] border", vegOnly ? "border-green-600 bg-green-600 text-white" : "border-[var(--line)]")}
          >
            <Leaf className="h-4 w-4" /> Veg only
          </button>
        }
      >
        {guide.intro}
        {guide.regional && <span className="mt-1 block text-xs">Showing {dest.regionName} regional staples — a dedicated {dest.name} guide is coming.</span>}
      </PageHeader>

      <section>
        <h2 className="section-title mb-3 !text-xl">Staple dishes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {dishes.map((d, i) => (
              <motion.article key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }} className="glass overflow-hidden">
                <SmartImage imageKey="food" label={d.name} seed={d.id} width={600} className="aspect-[4/3] w-full">
                  <button
                    type="button"
                    onClick={() => openPhoto({ imageKey: "food", label: d.name, seed: d.id, caption: d.localName ?? dest.name })}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur"
                  >
                    <Camera className="h-3 w-3" /> Save
                  </button>
                </SmartImage>
                <div className="p-3.5">
                  <div className="flex items-start gap-2">
                    <VegDot veg={d.veg} />
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold leading-tight">{d.name}</h3>
                      {d.localName && <p className="hand text-sm text-rose-500">{d.localName}</p>}
                    </div>
                  </div>
                  <p className="muted mt-2 text-sm leading-snug">{d.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-0.5" aria-label={`Spice level ${d.spice} of 3`}>
                      {[1, 2, 3].map((n) => (
                        <Flame key={n} className={cn("h-3.5 w-3.5", n <= d.spice ? "fill-rose-500 text-rose-500" : "text-stone-300 dark:text-stone-600")} />
                      ))}
                    </span>
                    <span className="font-semibold">{d.priceRange}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="section-title !text-xl">Iconic dhabas, lanes & legends</h2>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  sound.play("tick", { intensity: 0.5 });
                  setType(t);
                }}
                className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold", type === t ? "border-rose-500 bg-rose-500 text-white" : "border-[var(--line)]")}
              >
                {t === "All" ? "All" : `${TYPE_EMOJI[t]} ${t}`}
              </button>
            ))}
          </div>
        </div>
        {spots.length === 0 ? (
          <p className="glass muted p-6 text-center text-sm">No spots in this category — try another filter.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {spots.map((s) => (
              <motion.article key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass flex gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-marigold-100 to-rose-100 text-2xl dark:from-marigold-500/20 dark:to-rose-500/20">{TYPE_EMOJI[s.type]}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{s.name}</h3>
                    <span className="pill bg-black/5 !py-0.5 dark:bg-white/10">{s.type}</span>
                    {s.veg === "veg" && <VegDot veg />}
                  </div>
                  <p className="muted mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {s.area}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.hours}
                    </span>
                    <span>{s.priceForTwo ? `${inr(s.priceForTwo)} for two` : "Free"}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.mustOrder.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1 rounded-full bg-marigold-100 px-2 py-0.5 text-[11px] font-medium text-marigold-700 dark:bg-marigold-500/15 dark:text-marigold-300">
                        <Utensils className="h-3 w-3" /> {m}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="hand font-bold text-rose-600 dark:text-rose-300">Tip: </span>
                    {s.tip}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        <p className="muted mt-3 text-xs">Hours change often — call ahead or check a maps listing before heading out.</p>
      </section>
    </div>
  );
}
