import { DESTINATIONS, DESTINATION_BY_ID, DEFAULT_DESTINATION_ID } from "@data/destinations";
import { FARMHOUSES } from "@data/farmhouses";
import { FOOD_BY_DESTINATION, REGIONAL_FOOD } from "@data/food";
import { NATIONAL_EMERGENCY, REGIONAL_DEFAULTS, REGIONS } from "@data/regions";
import { STAYS } from "@data/stays";
import type { Destination, EmergencyContact, FoodGuide, Property, Region, Tier, Zone, ZoneLink } from "@data/types";

/** A destination with every optional field filled from its region's defaults. */
export type ResolvedDestination = Destination &
  Required<Pick<Destination, "zones" | "zoneLinks" | "transit" | "rentals" | "scams" | "trainTips">> & {
    emergency: EmergencyContact[];
    regionName: string;
  };

const cache = new Map<string, ResolvedDestination>();

export function getDestination(id: string | undefined | null): ResolvedDestination {
  const key = id && DESTINATION_BY_ID[id] ? id : DEFAULT_DESTINATION_ID;
  const hit = cache.get(key);
  if (hit) return hit;
  const d = DESTINATION_BY_ID[key];
  const defaults = REGIONAL_DEFAULTS[d.region];
  const zones: Zone[] = d.zones ?? [{ id: "core", name: d.name, vibe: d.tags.slice(0, 2).join(" · ") }];
  const zoneLinks: ZoneLink[] = d.zoneLinks ?? [];
  const resolved: ResolvedDestination = {
    ...d,
    zones,
    zoneLinks,
    transit: d.transit ?? defaults.transit,
    rentals: d.rentals ?? defaults.rentals,
    scams: [...(d.scams ?? []), ...defaults.scams],
    trainTips: d.trainTips ?? defaults.trainTips,
    emergency: [
      ...NATIONAL_EMERGENCY,
      ...(d.hospital ? [{ label: "Nearest major hospital", number: "108", note: d.hospital }] : []),
    ],
    regionName: REGIONS.find((r) => r.id === d.region)?.name ?? d.region,
  };
  cache.set(key, resolved);
  return resolved;
}

export function zoneName(dest: ResolvedDestination, zoneId: string): string {
  return dest.zones.find((z) => z.id === zoneId)?.name ?? dest.name;
}

/** Minutes between two zones (symmetric), plus any friction note. */
export function zoneTransit(dest: ResolvedDestination, from: string, to: string): { mins: number; note?: string } {
  if (from === to) return { mins: 15 };
  const link = dest.zoneLinks.find((l) => (l.from === from && l.to === to) || (l.from === to && l.to === from));
  return link ? { mins: link.mins, note: link.note } : { mins: 60 };
}

/* ─────────────────────────── Directory search ─────────────────────────── */

export interface DirectoryGroup {
  region: Region;
  regionName: string;
  emoji: string;
  tiers: { tier: Tier; items: Destination[] }[];
}

const normalise = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchDestinations(query: string, region?: Region | "all"): Destination[] {
  const q = normalise(query.trim());
  return DESTINATIONS.filter((d) => {
    if (region && region !== "all" && d.region !== region) return false;
    if (!q) return true;
    const hay = normalise([d.name, d.aka ?? "", d.state, d.tags.join(" "), d.tagline].join(" "));
    return q.split(/\s+/).every((part) => hay.includes(part));
  });
}

export function groupDirectory(items: Destination[]): DirectoryGroup[] {
  return REGIONS.map((r) => {
    const inRegion = items.filter((d) => d.region === r.id);
    const tiers = ([1, 2, 3] as Tier[])
      .map((tier) => ({ tier, items: inRegion.filter((d) => d.tier === tier) }))
      .filter((t) => t.items.length > 0);
    return { region: r.id, regionName: r.name, emoji: r.emoji, tiers };
  }).filter((g) => g.tiers.length > 0);
}

/* ─────────────────────────── Stays & food lookups ─────────────────────────── */

export function staysFor(destId: string): Property[] {
  return STAYS.filter((s) => s.destinationId === destId);
}

export function farmsFor(destId: string): Property[] {
  return FARMHOUSES.filter((s) => s.destinationId === destId);
}

export function regionProperties(region: Region, collection: "stay" | "farm"): Property[] {
  const pool = collection === "stay" ? STAYS : FARMHOUSES;
  return pool.filter((p) => DESTINATION_BY_ID[p.destinationId]?.region === region);
}

export const ALL_PROPERTIES: Property[] = [...STAYS, ...FARMHOUSES];

export function getProperty(id: string): Property | undefined {
  return ALL_PROPERTIES.find((p) => p.id === id);
}

export function foodFor(dest: Destination): FoodGuide & { regional: boolean } {
  const g = FOOD_BY_DESTINATION[dest.id];
  if (g) return { ...g, regional: false };
  return { destinationId: dest.id, ...REGIONAL_FOOD[dest.region], regional: true };
}
