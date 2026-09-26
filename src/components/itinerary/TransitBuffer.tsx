import { Coffee, Footprints, TriangleAlert } from "lucide-react";
import { cn, duration } from "@/lib/format";
import type { ScheduledItem } from "@/lib/itinerary";

/** The gap between two slot cards: travel time, friction notes and free time. */
export function TransitBuffer({ s }: { s: ScheduledItem }) {
  if (!s.transit && !s.waitBefore) return null;
  const heavy = !!s.transit && s.transit.mins >= 90;
  return (
    <div className="relative flex flex-col gap-1 py-2 pl-6 text-xs">
      <span className="absolute bottom-0 left-[11px] top-0 w-px border-l-2 border-dashed border-stone-300 dark:border-stone-700" aria-hidden />
      {s.transit && (
        <p className={cn("relative inline-flex items-start gap-1.5", heavy ? "font-semibold text-rose-600 dark:text-rose-300" : "muted")}>
          {heavy ? <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" /> : <Footprints className="mt-px h-3.5 w-3.5 shrink-0" />}
          <span>
            {s.transit.mins <= 15 ? "Short hop" : `~${duration(s.transit.mins)}`} · {s.transit.fromName} → {s.transit.toName}
            {s.transit.note && s.transit.mins >= 60 && <span className="block font-normal opacity-90">{s.transit.note}</span>}
          </span>
        </p>
      )}
      {s.waitBefore >= 20 && (
        <p className="muted relative inline-flex items-center gap-1.5">
          <Coffee className="h-3.5 w-3.5" /> {duration(s.waitBefore)} free — chai, siesta or wander
        </p>
      )}
    </div>
  );
}
