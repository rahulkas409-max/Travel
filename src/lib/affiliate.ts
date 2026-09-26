/**
 * Affiliate tagging for outbound booking links. The traveller pays exactly the
 * same price; the partner pays RoamIndia a commission on completed bookings.
 */
import type { Activity, Destination } from "@data/types";
import { AFFILIATE } from "@/config/business";
import { searchName } from "./links";

export interface TicketLink {
  id: string;
  label: string;
  href: string;
}

/** "Book tickets / tours" links for an activity (GetYourGuide & Klook search). */
export function ticketLinks(a: Activity, d: Destination): TicketLink[] {
  const q = `${a.name.split(/\s[—:–-]\s/)[0]} ${d.name.split(/\s(?:&|\()/)[0]}`;
  const enc = encodeURIComponent;
  const gyg = new URL(`https://www.getyourguide.com/s/`);
  gyg.searchParams.set("q", q);
  if (AFFILIATE.getYourGuidePartnerId) gyg.searchParams.set("partner_id", AFFILIATE.getYourGuidePartnerId);
  const klook = new URL(`https://www.klook.com/en-IN/search/result/`);
  klook.searchParams.set("query", `${d.name.split(/\s(?:&|\()/)[0]}`);
  if (AFFILIATE.klookAid) klook.searchParams.set("aid", AFFILIATE.klookAid);
  return [
    { id: "gyg", label: "GetYourGuide", href: gyg.toString() },
    { id: "klook", label: "Klook", href: klook.toString() },
    { id: "maps", label: "Google Maps", href: `https://www.google.com/maps/search/${enc(`${q}, ${searchName(d)}`)}` },
  ];
}

/** Activities where tickets / tours are commonly bookable online. */
export function isBookable(a: Activity): boolean {
  return !a.generic && a.cost >= 100 && ["heritage", "adventure", "nature", "wellness", "learning", "food"].includes(a.kind);
}

export const AFFILIATE_NOTE = "Some links are partner links: we may earn a small commission at no extra cost to you. It never affects rankings.";
