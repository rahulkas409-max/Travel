"use client";

import type { Property } from "@data/types";
import { Sprout } from "lucide-react";
import { StayCard } from "./StayCard";

const AMENITY_ICON: Array<[RegExp, string]> = [
  [/pool/i, "🏊"],
  [/conference|banquet|hall|barn|amphitheatre/i, "📽️"],
  [/lawn/i, "🌿"],
  [/bbq|barbecue|bonfire|campfire/i, "🔥"],
  [/farm|orchard|kitchen garden|plot/i, "🌾"],
  [/tractor|bullock|camel/i, "🚜"],
  [/pottery|print|craft/i, "🏺"],
  [/tea|coffee|cupping/i, "☕"],
  [/kayak|lake|river|jetty/i, "🛶"],
];

function amenityIcon(a: string) {
  return AMENITY_ICON.find(([re]) => re.test(a))?.[1] ?? "•";
}

/** Farmhouse / estate / agro-farm card: adds amenities & hands-on experiences. */
export function FarmhouseCard({ p, onOpen }: { p: Property; onOpen: () => void }) {
  return (
    <StayCard p={p} onOpen={onOpen} variant="farm">
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.amenities.slice(0, 5).map((a) => (
          <span key={a} className="rounded-lg bg-black/[0.04] px-2 py-1 text-[11px] dark:bg-white/[0.06]">
            {amenityIcon(a)} {a}
          </span>
        ))}
      </div>
      {p.experiences && (
        <p className="mt-2.5 flex items-start gap-1.5 text-xs text-sage-700 dark:text-sage-300">
          <Sprout className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>
            <b>Experiences:</b> {p.experiences.slice(0, 3).join(" · ")}
          </span>
        </p>
      )}
    </StayCard>
  );
}
