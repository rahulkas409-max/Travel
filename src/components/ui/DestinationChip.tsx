"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useState } from "react";
import { DestinationPicker } from "@/components/layout/DestinationSelector";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn } from "@/lib/format";

/** In-page "📍 Munnar · Change" switcher (replaces the old header location selector). */
export function DestinationChip({ className, light = false }: { className?: string; light?: boolean }) {
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
          "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition",
          light ? "bg-white/20 text-white backdrop-blur hover:bg-white/30" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
          className,
        )}
        aria-haspopup="dialog"
      >
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate">{destination.name}</span>
        <span className="shrink-0 opacity-70">· Change</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
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
