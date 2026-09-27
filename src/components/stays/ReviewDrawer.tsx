"use client";

import { DESTINATION_BY_ID } from "@data/destinations";
import type { Property, TravellerTag } from "@data/types";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, CalendarClock, Camera, Heart, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { Sheet } from "@/components/ui/Sheet";
import { SmartImage } from "@/components/ui/SmartImage";
import { ScoreBar, Stars } from "@/components/ui/Stars";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn, inrRange } from "@/lib/format";
import { propertySource } from "@/lib/imageSources";
import { useEnquiry } from "@/components/money/EnquiryModal";
import { NeighborhoodTag, SuitabilityPill } from "./NeighborhoodTag";
import { ReviewProsCons } from "./ReviewProsCons";

const TAG_EMOJI: Partial<Record<TravellerTag, string>> = {
  "Solo Female Traveler": "👩",
  Solo: "🎒",
  Couple: "💑",
  Honeymooners: "💞",
  Workationer: "💻",
  Family: "👨‍👩‍👧",
  "Friends Group": "🤙",
  "Corporate Team": "💼",
  "School Group": "🎓",
};

/** Deep review drawer: score breakdown, pros/cons, rooms, contacts & verified reviews. */
export function ReviewDrawer({ property: p, onClose }: { property: Property | null; onClose: () => void }) {
  const { savedStays, toggleSavedStay } = useTrip();
  const { openEnquiry } = useEnquiry();
  const { openPhoto } = usePhotoViewer();
  const [tagFilter, setTagFilter] = useState<TravellerTag | "all">("all");

  const tags = useMemo(() => (p ? Array.from(new Set(p.reviews.map((r) => r.tag))) : []), [p]);
  const reviews = p ? p.reviews.filter((r) => tagFilter === "all" || r.tag === tagFilter) : [];
  const saved = p ? savedStays.includes(p.id) : false;

  return (
    <Sheet
      open={!!p}
      onClose={() => {
        setTagFilter("all");
        onClose();
      }}
      side
      size="lg"
      title={p?.name}
      subtitle={p ? `${p.kind} · ${p.neighbourhood}` : undefined}
      footer={
        p && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.play(saved ? "tick" : "chime");
                toggleSavedStay(p.id);
              }}
              className="btn-ghost"
            >
              <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} /> {saved ? "Saved" : "Save"}
            </button>
            <button type="button" onClick={() => openEnquiry({ type: "property", propertyId: p.id, source: "review-drawer" })} className="btn-primary">
              Check availability
            </button>
          </div>
        )
      }
    >
      {p && (
        <div className="space-y-6">
          {/* Gallery */}
          <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5">
            {p.imageKeys.map((k, i) => (
              <button
                key={k + i}
                type="button"
                onClick={() => openPhoto({ source: propertySource(p, i, DESTINATION_BY_ID[p.destinationId]), label: p.name, caption: `${p.kind} · room & property photo` })}
                className="relative w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl sm:w-[60%]"
              >
                <SmartImage source={propertySource(p, i, DESTINATION_BY_ID[p.destinationId])} width={900} className="aspect-[4/3] w-full" />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Camera className="h-3 w-3" /> Save
                </span>
              </button>
            ))}
          </div>

          {/* Rating summary */}
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="rounded-2xl bg-slate-900 p-4 text-center text-white dark:bg-white/10">
              <p className="font-display text-4xl font-bold">{p.rating.toFixed(1)}</p>
              <Stars value={p.rating} size={14} className="justify-center" />
              <p className="mt-1 text-xs text-white/70">from {p.reviewCount}+ travellers</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <ScoreBar label="Cleanliness" value={p.scores.cleanliness} />
              <ScoreBar label="Food quality" value={p.scores.food} />
              <ScoreBar label="Safety" value={p.scores.safety} />
              <ScoreBar label="Location" value={p.scores.location} />
              <ScoreBar label="Value" value={p.scores.value} />
              {p.scores.pool ? <ScoreBar label="Pool upkeep" value={p.scores.pool} /> : <ScoreBar label="Staff & host" value={Math.min(5, p.rating + 0.1)} />}
              <div className="col-span-2">
                <ScoreBar label="Wi-Fi speed (remote work)" value={p.wifiMbps} max={150} suffix="Mbps" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {p.badges.map((b) => (
              <SuitabilityPill key={b} badge={b} />
            ))}
          </div>

          <ReviewProsCons pros={p.pros} cons={p.cons} />

          {/* Neighbourhood */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider opacity-70">Neighbourhood vibe</h3>
            <div className="flex flex-wrap gap-1.5">
              {p.neighbourhoodVibes.map((v) => (
                <NeighborhoodTag key={v} label={v} />
              ))}
            </div>
          </section>

          {/* Rooms */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider opacity-70">Rooms & rates</h3>
            <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
              {p.rooms.map((r) => (
                <div key={r.name} className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-3 py-2.5 text-sm last:border-0">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="muted text-xs">Sleeps {r.sleeps}</p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums">{inrRange(r.priceRange)}</p>
                </div>
              ))}
            </div>
            <p className="muted mt-1.5 text-[11px]">Approximate per {p.priceUnit}; weekends & peak season sit at the upper end.</p>
          </section>

          {p.experiences && (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider opacity-70">Hands-on experiences</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.experiences.map((e) => (
                  <span key={e} className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700 dark:bg-sage-500/15 dark:text-sage-300">
                    🌱 {e}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider opacity-70">Amenities</h3>
            <p className="text-sm">{p.amenities.join(" · ")}</p>
          </section>

          {/* Contact */}
          <section className="glass space-y-2 p-4 text-sm">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> {p.address}
            </p>
            <p className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> {p.phone} <span className="muted text-xs">(shared on booking)</span>
            </p>
            <p className="flex gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> Check-in {p.checkIn} · Check-out {p.checkOut}
            </p>
          </section>

          {/* Reviews */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider opacity-70">Traveller reviews</h3>
            <div className="no-scrollbar -mx-5 mb-3 flex gap-1.5 overflow-x-auto px-5">
              {(["all", ...tags] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagFilter(t)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    tagFilter === t ? "border-rose-500 bg-rose-500 text-white" : "border-[var(--line)] hover:bg-white/70 dark:hover:bg-white/10",
                  )}
                >
                  {t === "all" ? "All" : `${TAG_EMOJI[t] ?? ""} ${t}`}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {reviews.map((r) => (
                  <motion.li key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-[var(--line)] bg-white/60 p-3.5 dark:bg-white/[0.03]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {r.author} <span className="muted font-normal">· {r.from}</span>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="pill bg-marigold-100 !normal-case !tracking-normal text-marigold-700 dark:bg-marigold-500/15 dark:text-marigold-300">
                            {TAG_EMOJI[r.tag]} {r.tag}
                          </span>
                          {r.verified ? (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sage-700 dark:text-sage-300">
                              <BadgeCheck className="h-3.5 w-3.5" /> Verified stay
                            </span>
                          ) : (
                            <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold opacity-70 dark:bg-white/10">Sample review</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <Stars value={r.rating} size={12} />
                        <p className="muted text-[10px]">{r.date}</p>
                      </div>
                    </div>
                    <p className="mt-2 font-semibold">“{r.title}”</p>
                    <p className="muted mt-1 text-sm leading-relaxed">{r.body}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        </div>
      )}
    </Sheet>
  );
}
