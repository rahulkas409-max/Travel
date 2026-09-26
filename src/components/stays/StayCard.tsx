"use client";

import { DESTINATION_BY_ID } from "@data/destinations";
import type { Property } from "@data/types";
import { motion } from "framer-motion";
import { Camera, Heart, MessageSquareText, Users, Wifi } from "lucide-react";
import { useState } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/Stars";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";
import { propertySource } from "@/lib/imageSources";
import { SuitabilityPill } from "./NeighborhoodTag";

export function fitsBudget(p: Property, budgetPerPerson: number, travellers: number): boolean {
  const low = p.priceRange[0];
  if (p.priceUnit === "person / night") return low <= budgetPerPerson * 0.6;
  if (p.priceUnit === "night (whole property)") return low / Math.max(1, travellers) <= budgetPerPerson * 0.6;
  // Per-room: assume two sharing.
  return low / Math.min(2, Math.max(1, travellers)) <= budgetPerPerson * 0.6;
}

interface Props {
  p: Property;
  onOpen: () => void;
  variant?: "stay" | "farm";
  children?: React.ReactNode;
}

/** Card used for hostels, homestays, havelis & hotels. FarmhouseCard wraps it with farm-specific extras. */
export function StayCard({ p, onOpen, variant = "stay", children }: Props) {
  const { savedStays, toggleSavedStay, config, toast } = useTrip();
  const { openPhoto } = usePhotoViewer();
  const [photo, setPhoto] = useState(0);
  const saved = savedStays.includes(p.id);
  const within = fitsBudget(p, config.budget, config.travellers);

  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="glass flex flex-col overflow-hidden">
      <div className="relative">
        <SmartImage source={propertySource(p, photo, DESTINATION_BY_ID[p.destinationId])} width={800} className="aspect-[16/10] w-full" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="pill bg-white/90 text-slate-900 shadow backdrop-blur">{p.kind}</span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              sound.play(saved ? "tick" : "chime");
              toggleSavedStay(p.id);
              toast(saved ? "Removed from shortlist" : "❤️ Saved to your shortlist (prints in the PDF)");
            }}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full shadow backdrop-blur", saved ? "bg-rose-500 text-white" : "bg-white/90 text-slate-900")}
            aria-pressed={saved}
            aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
          >
            <Heart className={cn("h-[18px] w-[18px]", saved && "fill-current")} />
          </motion.button>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
          <div className="flex gap-1.5">
            {p.imageKeys.map((k, i) => (
              <button
                key={k + i}
                type="button"
                onClick={() => {
                  sound.play("tick", { intensity: 0.5 });
                  setPhoto(i);
                }}
                className={cn("h-2 rounded-full transition-all", i === photo ? "w-6 bg-white" : "w-2 bg-white/60")}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => openPhoto({ source: propertySource(p, photo, DESTINATION_BY_ID[p.destinationId]), label: p.name, caption: `${p.kind} · ${p.neighbourhood}` })}
            className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur"
          >
            <Camera className="h-3 w-3" /> Save Image
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug">{p.name}</h3>
            <p className="muted truncate text-xs">{p.neighbourhood}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold leading-none">{p.rating.toFixed(1)}</p>
            <Stars value={p.rating} size={11} />
            <p className="muted text-[10px]">{p.reviewCount} reviews</p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {p.badges.slice(0, 2).map((b) => (
            <SuitabilityPill key={b} badge={b} />
          ))}
        </div>

        {children}

        <div className="muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <Wifi className="h-3.5 w-3.5" /> {p.wifiMbps} Mbps
          </span>
          {variant === "farm" && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> up to {p.capacity}
            </span>
          )}
          <span>🧼 {p.scores.cleanliness.toFixed(1)}</span>
          <span>🍛 {p.scores.food.toFixed(1)}</span>
          {p.scores.pool && <span>🏊 {p.scores.pool.toFixed(1)}</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-base font-bold">
              {inr(p.priceRange[0])}
              <span className="muted text-xs font-medium"> – {inr(p.priceRange[1])}</span>
            </p>
            <p className="muted text-[11px]">per {p.priceUnit}</p>
            {within && <p className="mt-0.5 text-[11px] font-semibold text-sage-600 dark:text-sage-300">✓ Fits your ₹{config.budget.toLocaleString("en-IN")}/day</p>}
          </div>
          <button
            type="button"
            onClick={() => {
              sound.play("flip");
              onOpen();
            }}
            className="btn-primary !min-h-[40px] !px-3.5 !text-xs"
          >
            <MessageSquareText className="h-4 w-4" /> Reviews
          </button>
        </div>
      </div>
    </motion.article>
  );
}
