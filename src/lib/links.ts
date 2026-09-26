/**
 * Deep links to live availability on major platforms (prefilled with the
 * trip's destination, dates and guests) plus maps. RoamIndia stays free and
 * neutral: these simply open the provider's own search.
 */

import { GEO } from "@data/geo";
import type { Destination } from "@data/types";

export interface OutLink {
  id: string;
  label: string;
  sub: string;
  href: string;
  tone: string;
}

/** "Munnar, Kerala" / "Kanha, Madhya Pradesh" — what booking sites understand. */
export function searchName(d: Destination): string {
  const base = d.name.split(/\s(?:&|\()/)[0].replace(/\s+(Valley|Island)$/i, (m) => m);
  const state = d.state.split("/")[0].trim();
  return `${base}, ${state}`;
}

function addDays(iso: string, n: number): string {
  const dt = new Date(`${iso}T00:00:00`);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
}

function defaultStart(): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + 21);
  return dt.toISOString().slice(0, 10);
}

export function stayLinks(d: Destination, opts: { startDate?: string; nights: number; guests: number; farm?: boolean }): OutLink[] {
  const q = searchName(d);
  const checkin = opts.startDate || defaultStart();
  const checkout = addDays(checkin, Math.max(1, opts.nights));
  const guests = Math.max(1, opts.guests);
  const rooms = Math.max(1, Math.ceil(guests / 2));
  const enc = encodeURIComponent;
  return [
    {
      id: "booking",
      label: "Booking.com",
      sub: `${guests} guests · ${opts.nights} nights`,
      href: `https://www.booking.com/searchresults.html?ss=${enc(q)}&checkin=${checkin}&checkout=${checkout}&group_adults=${guests}&no_rooms=${rooms}&group_children=0`,
      tone: "from-sky-600 to-blue-800",
    },
    {
      id: "airbnb",
      label: opts.farm ? "Airbnb farm stays" : "Airbnb homes",
      sub: "Villas, farmhouses, cottages",
      href: `https://www.airbnb.co.in/s/${enc(q)}/homes?checkin=${checkin}&checkout=${checkout}&adults=${guests}${opts.farm ? "&query=farm" : ""}`,
      tone: "from-rose-500 to-pink-600",
    },
    {
      id: "gmaps",
      label: "Google Maps",
      sub: opts.farm ? "Farmhouses nearby" : "Hotels & homestays nearby",
      href: `https://www.google.com/maps/search/${enc(`${opts.farm ? "farmhouse resort" : "hotels homestays"} near ${q}`)}`,
      tone: "from-emerald-500 to-green-700",
    },
    {
      id: "mmt",
      label: "MakeMyTrip",
      sub: "Hotels & homestays",
      href: "https://www.makemytrip.com/hotels/",
      tone: "from-red-500 to-red-700",
    },
    {
      id: "goibibo",
      label: "Goibibo",
      sub: "Hotels & GoStays",
      href: "https://www.goibibo.com/hotels/",
      tone: "from-orange-500 to-amber-600",
    },
  ];
}

export function travelLinks(d: Destination, startDate?: string, days = 3): OutLink[] {
  const q = searchName(d);
  const dep = startDate || defaultStart();
  const ret = addDays(dep, Math.max(0, days - 1));
  const enc = encodeURIComponent;
  const g = GEO[d.id];
  return [
    { id: "flights", label: "Google Flights", sub: `Flights to ${d.gateway.split("·")[0].split("(")[0].trim()}`, href: `https://www.google.com/travel/flights?q=${enc(`flights to ${q} on ${dep} returning ${ret}`)}`, tone: "from-sky-500 to-indigo-600" },
    { id: "irctc", label: "IRCTC", sub: "Book trains", href: "https://www.irctc.co.in/nget/train-search", tone: "from-blue-700 to-slate-800" },
    { id: "redbus", label: "redBus", sub: "Buses & sleepers", href: "https://www.redbus.in/", tone: "from-red-500 to-rose-700" },
    {
      id: "map",
      label: "Open map",
      sub: "Directions & places",
      href: g ? `https://www.google.com/maps/search/?api=1&query=${g.lat},${g.lon}` : `https://www.google.com/maps/search/${enc(q)}`,
      tone: "from-emerald-500 to-teal-700",
    },
  ];
}

export function osmUrl(d: Destination): string | null {
  const g = GEO[d.id];
  return g ? `https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lon}#map=11/${g.lat}/${g.lon}` : null;
}

export function foodSearchUrl(d: Destination): string {
  return `https://www.google.com/maps/search/${encodeURIComponent(`best local food in ${searchName(d)}`)}`;
}

/** Great-circle distance in km (for "nearby destinations"). */
export function distanceKm(a: string, b: string): number {
  const A = GEO[a];
  const B = GEO[b];
  if (!A || !B) return Infinity;
  const R = 6371;
  const dLat = ((B.lat - A.lat) * Math.PI) / 180;
  const dLon = ((B.lon - A.lon) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((A.lat * Math.PI) / 180) * Math.cos((B.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
