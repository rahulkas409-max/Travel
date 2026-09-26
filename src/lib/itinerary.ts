/**
 * Pacing-aware itinerary engine.
 *
 * generatePlan()  → picks activities per day & slot for the active occasion,
 *                    clustering days by zone so you don't criss-cross a region.
 * scheduleDay()   → turns an ordered list into real clock times, inserting
 *                    transit buffers and waiting for golden-hour anchors.
 * analyseDay()    → pacing meter + warnings (overload, ghat delays, missed
 *                    sunsets, school curfews, budget).
 * swapOptions()   → alternatives for a slot that match the occasion.
 */

import { OCCASION_TEMPLATES } from "@data/occasions";
import type { Activity, Occasion, Pace, SlotType } from "@data/types";
import { type ResolvedDestination, zoneName, zoneTransit } from "./destinations";
import { clock, duration, hashString, seededRng } from "./format";

export interface PlanItem {
  uid: string;
  activityId: string;
}

export interface PlanDay {
  day: number;
  /** Where you sleep / start the day. */
  stayZone: string;
  items: PlanItem[];
}

export interface TripConfig {
  destinationId: string;
  occasion: Occasion;
  pace: Pace;
  days: number;
  /** Per-person daily budget in INR. */
  budget: number;
  travellers: number;
  startDate: string;
  seed: number;
}

export const SLOT_META: Record<SlotType, { label: string; emoji: string; anchor: number }> = {
  morning: { label: "Morning", emoji: "🌅", anchor: 7 * 60 },
  afternoon: { label: "Afternoon", emoji: "☀️", anchor: 13 * 60 },
  sunset: { label: "Sunset", emoji: "🌇", anchor: 16 * 60 + 45 },
  night: { label: "Night", emoji: "🌙", anchor: 19 * 60 + 30 },
};

export const PACE_META: Record<Pace, { label: string; emoji: string; slots: SlotType[]; dayStart: number; budgetMins: number; blurb: string }> = {
  relaxed: {
    label: "Relaxed",
    emoji: "🐢",
    slots: ["morning", "sunset", "night"],
    dayStart: 9 * 60,
    budgetMins: 8 * 60,
    blurb: "3 plans a day, long lunches, siesta built in",
  },
  balanced: {
    label: "Balanced",
    emoji: "⚖️",
    slots: ["morning", "afternoon", "sunset", "night"],
    dayStart: 8 * 60,
    budgetMins: 10.5 * 60,
    blurb: "4 plans a day with breathing room",
  },
  packed: {
    label: "Packed",
    emoji: "⚡",
    slots: ["morning", "morning", "afternoon", "sunset", "night"],
    dayStart: 6 * 60 + 30,
    budgetMins: 13 * 60,
    blurb: "5 plans a day — early starts, see it all",
  },
};

/* ─────────────────────────── Activity pool ─────────────────────────── */

const FREE_TIME: Record<SlotType, Omit<Activity, "id" | "zone">> = {
  morning: { name: "Slow morning — breakfast & wander at leisure", slot: "morning", durationMins: 90, occasions: ["romantic", "corporate", "school", "solo"], kind: "wellness", cost: 0, tip: "Leave one unplanned block — it's where the best travel stories come from.", generic: true },
  afternoon: { name: "Siesta & free time", slot: "afternoon", durationMins: 120, occasions: ["romantic", "corporate", "school", "solo"], kind: "wellness", cost: 0, tip: "Midday heat is real across most of India — rest, read or hit the pool.", generic: true },
  sunset: { name: "Golden hour — find your own viewpoint", slot: "sunset", durationMins: 60, occasions: ["romantic", "corporate", "school", "solo"], kind: "nature", cost: 0, tip: "Ask your host for their favourite quiet sunset spot.", generic: true },
  night: { name: "Easy dinner near your stay", slot: "night", durationMins: 90, occasions: ["romantic", "corporate", "school", "solo"], kind: "food", cost: 400, tip: "Early night before tomorrow's plans.", generic: true },
};

export function templateActivities(dest: ResolvedDestination, occasion: Occasion): Activity[] {
  return OCCASION_TEMPLATES[occasion].map((t) => ({
    id: `${dest.id}~${occasion}~${t.key}`,
    name: t.name.replace("{place}", dest.name),
    zone: dest.zones[0].id,
    slot: t.slot,
    durationMins: t.durationMins,
    occasions: [occasion],
    kind: t.kind,
    cost: t.cost,
    tip: t.tip,
    generic: true,
  }));
}

export function activityPool(dest: ResolvedDestination, occasion: Occasion): Activity[] {
  return [...dest.highlights, ...templateActivities(dest, occasion)];
}

/** Resolve any activity id that can appear in a saved plan. */
export function findActivity(dest: ResolvedDestination, id: string): Activity | undefined {
  const hl = dest.highlights.find((a) => a.id === id);
  if (hl) return hl;
  if (id.startsWith(`${dest.id}~free~`)) {
    const slot = id.split("~")[2] as SlotType;
    const base = FREE_TIME[slot];
    return base ? { ...base, id, zone: dest.zones[0].id } : undefined;
  }
  const [, occ] = id.split("~");
  if (occ && occ in OCCASION_TEMPLATES) return templateActivities(dest, occ as Occasion).find((a) => a.id === id);
  return undefined;
}

function freeActivity(dest: ResolvedDestination, slot: SlotType, zone: string): Activity {
  return { ...FREE_TIME[slot], id: `${dest.id}~free~${slot}`, zone };
}

/* ─────────────────────────── Generation ─────────────────────────── */

let uidCounter = 0;
export function newUid(): string {
  uidCounter += 1;
  return `${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function scoreActivity(
  a: Activity,
  ctx: { occasion: Occasion; zone: string; slot: SlotType; budget: number; dest: ResolvedDestination; rng: () => number },
): number {
  let s = 0;
  if (a.occasions.includes(ctx.occasion)) s += 6;
  else s -= 5;
  if (a.slot === ctx.slot) s += 5;
  else s -= 10;
  if (a.zone === ctx.zone) s += 4;
  else s -= zoneTransit(ctx.dest, ctx.zone, a.zone).mins / 30;
  if (!a.generic) s += 2.5;
  if (a.cost > ctx.budget * 0.6) s -= 3;
  // Guard-rails per cohort
  if (ctx.occasion === "school" && (a.kind === "nightlife" || (a.slot === "night" && !a.occasions.includes("school")))) s -= 50;
  if (ctx.occasion === "corporate" && a.kind === "adventure" && a.durationMins > 240) s -= 3;
  return s + ctx.rng() * 1.8;
}

/**
 * Order zones into contiguous "stay blocks" so days cluster geographically.
 * Zones with no relevant activities (e.g. the "South Goa" pointer zone on the
 * North Goa page) are skipped.
 */
function planZones(dest: ResolvedDestination, occasion: Occasion, days: number): string[] {
  const relevance = dest.zones
    .map((z) => ({
      id: z.id,
      count: dest.highlights.filter((h) => h.zone === z.id && h.occasions.includes(occasion)).length,
      any: dest.highlights.filter((h) => h.zone === z.id).length,
    }))
    .filter((z) => z.any > 0);
  if (relevance.length === 0) return Array.from({ length: days }, () => dest.zones[0].id);
  const core = relevance.find((z) => z.id === "core");
  const rest = relevance.filter((z) => z.id !== "core").sort((a, b) => b.count - a.count);
  const ordered = core ? [core, ...rest] : rest;
  // Only give a zone its own day(s) if it has at least 2 activities for this cohort.
  const worthy = ordered.filter((z, i) => i === 0 || z.count >= 2);
  const used = worthy.slice(0, Math.max(1, Math.min(worthy.length, Math.ceil(days / 1.5))));
  return Array.from({ length: days }, (_, i) => used[Math.min(used.length - 1, Math.floor((i * used.length) / days))].id);
}

export function generatePlan(dest: ResolvedDestination, cfg: TripConfig): PlanDay[] {
  const rng = seededRng(hashString(`${dest.id}|${cfg.occasion}|${cfg.pace}|${cfg.days}|${cfg.seed}`));
  const pool = activityPool(dest, cfg.occasion);
  const zones = planZones(dest, cfg.occasion, cfg.days);
  const slots = PACE_META[cfg.pace].slots;
  const usedCurated = new Set<string>();
  const genericUse = new Map<string, number>();
  const genericLastDay = new Map<string, number>();

  return zones.map((zone, dayIdx) => {
    const usedToday = new Set<string>();
    const items: PlanItem[] = slots.map((slot) => {
      const ranked = pool
        .filter((a) => !usedToday.has(a.id))
        .filter((a) => (a.generic ? true : !usedCurated.has(a.id)))
        .map((a) => {
          let s = scoreActivity(a, { occasion: cfg.occasion, zone, slot, budget: cfg.budget, dest, rng });
          if (a.generic) {
            s -= (genericUse.get(a.id) ?? 0) * 4;
            // Never repeat the same template on back-to-back days.
            if (genericLastDay.get(a.id) === dayIdx - 1) s -= 12;
          }
          return { a, s };
        })
        .sort((x, y) => y.s - x.s);
      const best = ranked[0];
      // Free time scores a flat 6 — better an open block than a poor fit.
      const pick = best && best.s > 6 ? best.a : freeActivity(dest, slot, zone);
      usedToday.add(pick.id);
      if (pick.generic) {
        genericUse.set(pick.id, (genericUse.get(pick.id) ?? 0) + 1);
        genericLastDay.set(pick.id, dayIdx);
      } else usedCurated.add(pick.id);
      return { uid: newUid(), activityId: pick.id };
    });
    return { day: dayIdx + 1, stayZone: zone, items };
  });
}

/* ─────────────────────────── Scheduling & pacing ─────────────────────────── */

export interface ScheduledItem {
  item: PlanItem;
  activity: Activity;
  /** Slot label for this position (from the pace template). */
  positionSlot: SlotType;
  start: number;
  end: number;
  waitBefore: number;
  transit: { mins: number; from: string; to: string; fromName: string; toName: string; note?: string } | null;
}

export type WarningLevel = "info" | "warn" | "danger";

export interface PacingWarning {
  id: string;
  level: WarningLevel;
  title: string;
  detail: string;
  itemUid?: string;
}

export interface DayAnalysis {
  schedule: ScheduledItem[];
  activeMins: number;
  transitMins: number;
  /** 0–150ish: 100 = exactly at your pace budget. */
  load: number;
  cost: number;
  warnings: PacingWarning[];
  endTime: number;
}

export function scheduleDay(dest: ResolvedDestination, day: PlanDay, pace: Pace): ScheduledItem[] {
  const paceSlots = PACE_META[pace].slots;
  let t = PACE_META[pace].dayStart;
  let prevZone = day.stayZone;
  const out: ScheduledItem[] = [];
  day.items.forEach((item, i) => {
    const activity = findActivity(dest, item.activityId) ?? freeActivity(dest, paceSlots[i] ?? "afternoon", day.stayZone);
    const leg = zoneTransit(dest, prevZone, activity.zone);
    const transit =
      i === 0 && activity.zone === day.stayZone
        ? null
        : {
            mins: leg.mins,
            from: prevZone,
            to: activity.zone,
            fromName: i === 0 ? `Your stay (${zoneName(dest, prevZone)})` : zoneName(dest, prevZone),
            toName: zoneName(dest, activity.zone),
            note: leg.note,
          };
    const arrive = t + (transit?.mins ?? 0);
    const anchor = SLOT_META[activity.slot].anchor;
    const wait = anchor > arrive && anchor - arrive <= 5 * 60 ? anchor - arrive : 0;
    const start = arrive + wait;
    const end = start + activity.durationMins;
    out.push({
      item,
      activity,
      positionSlot: paceSlots[Math.min(i, paceSlots.length - 1)] ?? activity.slot,
      start,
      end,
      waitBefore: wait,
      transit,
    });
    t = end;
    prevZone = activity.zone;
  });
  return out;
}

export function analyseDay(
  dest: ResolvedDestination,
  day: PlanDay,
  cfg: Pick<TripConfig, "pace" | "occasion" | "budget">,
): DayAnalysis {
  const schedule = scheduleDay(dest, day, cfg.pace);
  const activeMins = schedule.reduce((s, x) => s + x.activity.durationMins, 0);
  const transitMins = schedule.reduce((s, x) => s + (x.transit?.mins ?? 0), 0);
  const cost = schedule.reduce((s, x) => s + x.activity.cost, 0);
  const budgetMins = PACE_META[cfg.pace].budgetMins;
  const load = Math.round(((activeMins + transitMins) / budgetMins) * 100);
  const endTime = schedule.length ? schedule[schedule.length - 1].end : PACE_META[cfg.pace].dayStart;
  const warnings: PacingWarning[] = [];

  if (load > 115) {
    warnings.push({
      id: `load-${day.day}`,
      level: "danger",
      title: "Unrealistic day",
      detail: `${duration(activeMins + transitMins)} of plans + travel vs a ${duration(budgetMins)} ${PACE_META[cfg.pace].label.toLowerCase()} day. Swap or drop one stop.`,
    });
  } else if (load > 100) {
    warnings.push({
      id: `load-${day.day}`,
      level: "warn",
      title: "Tight day",
      detail: `Running ${load - 100}% over your pace — no buffer for traffic or long lunches.`,
    });
  }

  schedule.forEach((s) => {
    if (s.transit && (s.transit.mins >= 90 || (s.transit.note && s.transit.mins >= 60))) {
      warnings.push({
        id: `transit-${s.item.uid}`,
        level: s.transit.mins >= 140 ? "danger" : "warn",
        title: `Transit friction: ${s.transit.fromName} → ${s.transit.toName}`,
        detail: `~${duration(s.transit.mins)} each way. ${s.transit.note ?? "Consider regrouping this stop with others in the same area."}`,
        itemUid: s.item.uid,
      });
    }
    if (s.activity.slot === "sunset" && (s.start > 18 * 60 + 15 || s.start < 15 * 60)) {
      warnings.push({
        id: `sunset-${s.item.uid}`,
        level: "warn",
        title: "Sunset timing is off",
        detail: `"${s.activity.name}" starts at ${clock(s.start)} — aim to arrive by ~5 PM for golden hour.`,
        itemUid: s.item.uid,
      });
    }
    if (s.activity.slot === "morning" && s.start > 12 * 60) {
      warnings.push({
        id: `morning-${s.item.uid}`,
        level: "info",
        title: "Best done in the morning",
        detail: `"${s.activity.name}" is ideal early (cooler, fewer crowds). It's now at ${clock(s.start)}.`,
        itemUid: s.item.uid,
      });
    }
    if (s.activity.slot === "night" && s.start < 17 * 60) {
      warnings.push({
        id: `night-${s.item.uid}`,
        level: "info",
        title: "This one shines after dark",
        detail: `"${s.activity.name}" is scheduled at ${clock(s.start)}. Move it to the end of the day.`,
        itemUid: s.item.uid,
      });
    }
  });

  if (endTime > 23 * 60 + 30) {
    warnings.push({ id: `late-${day.day}`, level: "warn", title: "Very late finish", detail: `Day ends around ${clock(endTime)}. Tomorrow's morning plans will suffer.` });
  }
  if (cfg.occasion === "school" && endTime > 21 * 60 + 30) {
    warnings.push({ id: `curfew-${day.day}`, level: "danger", title: "Past student lights-out", detail: `Wraps at ${clock(endTime)} — school trips should end by 9:30 PM.` });
  }
  if (cost > cfg.budget) {
    warnings.push({
      id: `cost-${day.day}`,
      level: "info",
      title: "Activities exceed daily budget",
      detail: `Tickets & experiences ≈ ₹${cost.toLocaleString("en-IN")}/person vs your ₹${cfg.budget.toLocaleString("en-IN")}/day (before stay & food).`,
    });
  }

  return { schedule, activeMins, transitMins, load, cost, warnings, endTime };
}

/** Friction between consecutive days (e.g. moving North → South Goa). */
export function transferWarnings(dest: ResolvedDestination, plan: PlanDay[]): PacingWarning[] {
  const out: PacingWarning[] = [];
  for (let i = 1; i < plan.length; i++) {
    const a = plan[i - 1].stayZone;
    const b = plan[i].stayZone;
    if (a === b) continue;
    const leg = zoneTransit(dest, a, b);
    if (leg.mins >= 120) {
      out.push({
        id: `transfer-${i}`,
        level: "warn",
        title: `Day ${i + 1} is a transfer day`,
        detail: `${zoneName(dest, a)} → ${zoneName(dest, b)} takes ~${duration(leg.mins)}. ${leg.note ?? "Check out early and keep the first slot light."}`,
      });
    }
  }
  return out;
}

export interface SwapOption {
  activity: Activity;
  transitDelta: number;
  matchesOccasion: boolean;
}

export function swapOptions(
  dest: ResolvedDestination,
  plan: PlanDay[],
  dayIdx: number,
  itemIdx: number,
  cfg: Pick<TripConfig, "occasion" | "pace" | "budget">,
): SwapOption[] {
  const day = plan[dayIdx];
  const current = findActivity(dest, day.items[itemIdx].activityId);
  const slot = current?.slot ?? PACE_META[cfg.pace].slots[itemIdx] ?? "afternoon";
  const used = new Set(plan.flatMap((d) => d.items.map((i) => i.activityId)));
  const usedToday = new Set(day.items.map((i) => i.activityId));
  const prevZone = itemIdx > 0 ? findActivity(dest, day.items[itemIdx - 1].activityId)?.zone ?? day.stayZone : day.stayZone;
  const baseLeg = current ? zoneTransit(dest, prevZone, current.zone).mins : 0;

  // Curated spots appear once per trip; flexible ideas can repeat on other days.
  const candidates = [...activityPool(dest, cfg.occasion), freeActivity(dest, slot, day.stayZone)]
    .filter((a) => a.id !== current?.id && !usedToday.has(a.id))
    .filter((a) => (a.generic ? true : !used.has(a.id)))
    .filter((a) => !(cfg.occasion === "school" && a.kind === "nightlife"));

  return candidates
    .map((a) => ({
      activity: a,
      transitDelta: zoneTransit(dest, prevZone, a.zone).mins - baseLeg,
      matchesOccasion: a.occasions.includes(cfg.occasion),
    }))
    .sort(
      (x, y) =>
        Number(y.activity.slot === slot) - Number(x.activity.slot === slot) ||
        Number(y.matchesOccasion) - Number(x.matchesOccasion) ||
        Number(!!x.activity.generic) - Number(!!y.activity.generic) ||
        x.transitDelta - y.transitDelta,
    )
    .slice(0, 12);
}

/** Aggregate trip-wide numbers for the overview, PDF and WhatsApp exports. */
export function tripTotals(dest: ResolvedDestination, plan: PlanDay[], cfg: TripConfig) {
  const analyses = plan.map((d) => analyseDay(dest, d, cfg));
  const activityCost = analyses.reduce((s, a) => s + a.cost, 0);
  const transitMins = analyses.reduce((s, a) => s + a.transitMins, 0);
  const avgLoad = analyses.length ? Math.round(analyses.reduce((s, a) => s + a.load, 0) / analyses.length) : 0;
  const warnings = analyses.reduce((s, a) => s + a.warnings.filter((w) => w.level !== "info").length, 0) + transferWarnings(dest, plan).length;
  return { analyses, activityCost, transitMins, avgLoad, warnings, estimatedTotal: cfg.budget * cfg.days * cfg.travellers };
}
