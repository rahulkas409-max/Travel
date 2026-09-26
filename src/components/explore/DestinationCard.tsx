"use client";

import { fromPrice } from "@data/collections";
import type { Destination } from "@data/types";
import { Mountain, Sprout } from "lucide-react";
import Link from "next/link";
import { TierBadge } from "@/components/layout/DestinationSelector";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn, inr } from "@/lib/format";
import { destinationSource } from "@/lib/imageSources";

/** Photo-led destination card (links to the destination detail page). */
export function DestinationCard({ d, className, size = "md" }: { d: Destination; className?: string; size?: "md" | "lg" }) {
  return (
    <Link
      href={`/destinations/${d.id}`}
      className={cn(
        "group relative block shrink-0 snap-start overflow-hidden rounded-3xl bg-slate-900 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl",
        size === "lg" ? "aspect-[4/5]" : "aspect-[3/4]",
        className,
      )}
    >
      <SmartImage source={destinationSource(d)} width={640} className="absolute inset-0 h-full w-full" imgClassName="transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/5" />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1">
        <TierBadge tier={d.tier} className="!bg-white/90 !text-slate-900" />
        {d.farmhouseHub && (
          <span className="pill !bg-sage-500/90 !px-2 !py-0.5 !text-[10px] text-white">
            <Sprout className="h-3 w-3" /> Farms
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/75">{d.state}</p>
        <h3 className="font-display text-2xl font-bold leading-tight">{d.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-white/80">{d.tagline}</p>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 text-white/80">
            <Mountain className="h-3 w-3" /> {d.elevation.toLocaleString("en-IN")} m · {d.idealMonths.split("·")[0].trim()}
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-900">from {inr(fromPrice(d))}</span>
        </div>
      </div>
    </Link>
  );
}
