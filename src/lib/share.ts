import { OCCASION_BY_ID } from "@data/occasions";
import type { Property } from "@data/types";
import type { ResolvedDestination } from "./destinations";
import { clock, dayDate, duration, inr, inrRange } from "./format";
import { PACE_META, SLOT_META, analyseDay, type PlanDay, type TripConfig } from "./itinerary";

const SLOT_EMOJI = { morning: "🌅", afternoon: "☀️", sunset: "🌇", night: "🌙" } as const;

/** Formats the whole plan as an emoji-rich WhatsApp message (WhatsApp *bold* / _italic_ syntax). */
export function formatWhatsApp(
  dest: ResolvedDestination,
  plan: PlanDay[],
  cfg: TripConfig,
  stays: Property[],
  opts: { includeTips?: boolean } = {},
): string {
  const occ = OCCASION_BY_ID[cfg.occasion];
  const lines: string[] = [];
  lines.push(`🧭 *RoamIndia Trip — ${dest.name}*`);
  if (dest.aka) lines.push(`_${dest.aka}_`);
  lines.push("");
  lines.push(`${occ.emoji} ${occ.label}`);
  lines.push(`📅 ${cfg.days} day${cfg.days > 1 ? "s" : ""}${cfg.startDate ? ` · from ${dayDate(cfg.startDate, 0)}` : ""} · ${PACE_META[cfg.pace].emoji} ${PACE_META[cfg.pace].label} pace`);
  lines.push(`👥 ${cfg.travellers} traveller${cfg.travellers > 1 ? "s" : ""} · 💰 ~${inr(cfg.budget)}/person/day`);
  lines.push(`🗓️ Best months: ${dest.idealMonths}`);
  lines.push(`✈️ ${dest.gateway}`);

  plan.forEach((day, i) => {
    const a = analyseDay(dest, day, cfg);
    const date = dayDate(cfg.startDate, i);
    lines.push("");
    lines.push(`━━━━━━━━━━━━`);
    lines.push(`*Day ${day.day}${date ? ` · ${date}` : ""}*`);
    a.schedule.forEach((s) => {
      if (s.transit && s.transit.mins >= 30) lines.push(`   🛵 _${duration(s.transit.mins)} to ${s.transit.toName}_`);
      lines.push(`${SLOT_EMOJI[s.activity.slot]} ${clock(s.start)} — ${s.activity.name} (${duration(s.activity.durationMins)})`);
      if (opts.includeTips) lines.push(`   💡 ${s.activity.tip}`);
    });
    const warn = a.warnings.find((w) => w.level !== "info");
    if (warn) lines.push(`⚠️ ${warn.title}`);
  });

  if (stays.length) {
    lines.push("");
    lines.push("🏡 *Stays shortlisted*");
    stays.slice(0, 4).forEach((s) => lines.push(`• ${s.name} (${s.kind}) — ⭐ ${s.rating} · ${inrRange(s.priceRange)}/${s.priceUnit}`));
  }

  lines.push("");
  lines.push("🚨 *Emergency*: 112 · Ambulance 108 · Tourist helpline 1800-11-1363");
  lines.push("");
  lines.push("_Planned free on RoamIndia — no login, no paywall._");
  return lines.join("\n");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall back below */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export { SLOT_META };
