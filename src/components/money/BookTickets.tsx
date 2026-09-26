import type { Activity, Destination } from "@data/types";
import { Ticket } from "lucide-react";
import { isBookable, ticketLinks } from "@/lib/affiliate";

/** Small "Book tickets" row on bookable activities (partner links). */
export function BookTickets({ a, d }: { a: Activity; d: Destination }) {
  if (!isBookable(a)) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
      <span className="inline-flex items-center gap-1 font-bold opacity-70">
        <Ticket className="h-3.5 w-3.5" /> Tickets & tours:
      </span>
      {ticketLinks(a, d).map((l) => (
        <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer sponsored" className="rounded-full border border-[var(--line)] px-2 py-0.5 font-semibold hover:border-rose-400 hover:text-rose-600">
          {l.label} ↗
        </a>
      ))}
    </div>
  );
}
