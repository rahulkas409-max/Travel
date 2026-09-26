"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import { BadgePercent, MessageSquareQuote } from "lucide-react";
import { useTrip } from "@/context/TripContext";
import { cn } from "@/lib/format";
import { useEnquiry } from "./EnquiryModal";

/** "Get free quotes" card — prominent for offsites & school trips, subtle otherwise. */
export function QuoteCta({ className, source, destinationId }: { className?: string; source: string; destinationId?: string }) {
  const { config } = useTrip();
  const { openEnquiry } = useEnquiry();
  const group = config.occasion === "corporate" || config.occasion === "school";
  const occ = OCCASION_BY_ID[config.occasion];

  return (
    <div className={cn("overflow-hidden rounded-2xl p-4", group ? "bg-gradient-to-br from-sage-600 to-slate-900 text-white shadow-lift" : "glass", className)}>
      <p className={cn("flex items-center gap-2 text-sm font-bold", !group && "text-[var(--ink)]")}>
        <MessageSquareQuote className="h-4 w-4" /> {group ? `Booking for a ${occ.short.toLowerCase()} group?` : "Want us to book it for you?"}
      </p>
      <p className={cn("mt-1 text-xs", group ? "text-white/80" : "muted")}>
        {group ? "Get 3 free quotes from verified farmhouses, resorts & operators — lawns, halls, buses, meals included." : "Tell us your dates — we'll send the best-value stay & transport options. Free, no login."}
      </p>
      <button
        type="button"
        onClick={() => openEnquiry({ type: "group", destinationId, source })}
        className={cn("btn mt-3 w-full !min-h-[42px]", group ? "bg-white text-slate-900 hover:bg-sand-100" : "btn-primary")}
      >
        <BadgePercent className="h-4 w-4" /> Get free quotes
      </button>
    </div>
  );
}
