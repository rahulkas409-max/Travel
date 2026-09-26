"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import { TIER_LABEL } from "@data/regions";
import type { Property } from "@data/types";
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useTrip } from "@/context/TripContext";
import { farmsFor, foodFor, getProperty, staysFor, type ResolvedDestination } from "@/lib/destinations";
import { clock, dayDate, duration, inr, inrRange } from "@/lib/format";
import { PACE_META, SLOT_META, analyseDay, transferWarnings, type DayAnalysis, type PlanDay, type TripConfig } from "@/lib/itinerary";

export const DOSSIER_ID = "roamindia-dossier";

/* A4 @ 96 dpi = 794 × 1123 CSS px. Explicit hex colours keep html2canvas output identical in dark mode. */
const C = {
  ink: "#1c1917",
  soft: "#57534e",
  faint: "#a8a29e",
  line: "#e7e0d4",
  sand: "#faf7f2",
  sand2: "#f3ece0",
  marigold: "#f59e0b",
  rose: "#e06d53",
  sage: "#588157",
};
const serif = `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif`;
const sans = `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;

const PAGE: CSSProperties = {
  width: 794,
  height: 1123,
  background: "#ffffff",
  color: C.ink,
  fontFamily: sans,
  position: "relative",
  overflow: "hidden",
  boxSizing: "border-box",
  padding: "48px 52px 64px",
  marginBottom: 24,
};

/** Mounted once at the app root; export buttons capture it by id. */
export function DossierHost() {
  const { hydrated } = useTrip();
  if (!hydrated) return null;
  return (
    <div className="dossier-offscreen print-root" aria-hidden="true">
      <PrintDossier />
    </div>
  );
}

export function pickDossierStays(dest: ResolvedDestination, cfg: TripConfig, savedIds: string[]): Property[] {
  const saved = savedIds.map(getProperty).filter((p): p is Property => !!p && p.destinationId === dest.id);
  if (saved.length) return saved.slice(0, 4);
  return [...staysFor(dest.id), ...farmsFor(dest.id)]
    .filter((p) => p.occasions.includes(cfg.occasion))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
}

/** Split days into pages by estimated row height so nothing spills off the A4 sheet. */
function paginateDays(analyses: { day: PlanDay; a: DayAnalysis }[]) {
  const pages: { day: PlanDay; a: DayAnalysis }[][] = [];
  const BUDGET = 900;
  let cur: typeof analyses = [];
  let used = 0;
  analyses.forEach((x) => {
    // Row ≈ 52px, +16 when the tip wraps to a second line, +14 for a transit note.
    const rows = x.a.schedule.reduce((sum, s) => sum + 52 + (s.activity.tip.length > 92 || s.activity.name.length > 60 ? 16 : 0) + (s.transit && s.transit.mins >= 30 ? 14 : 0), 0);
    const h = 66 + rows + (x.a.warnings.some((w) => w.level !== "info") ? 34 : 0);
    if (cur.length && used + h > BUDGET) {
      pages.push(cur);
      cur = [];
      used = 0;
    }
    cur.push(x);
    used += h;
  });
  if (cur.length) pages.push(cur);
  return pages;
}

export const PrintDossier = forwardRef<HTMLDivElement, { preview?: boolean }>(function PrintDossier({ preview = false }, ref) {
  const { destination: dest, plan, config: cfg, savedStays } = useTrip();
  const occ = OCCASION_BY_ID[cfg.occasion];
  const analyses = plan.map((day) => ({ day, a: analyseDay(dest, day, cfg) }));
  const dayPages = paginateDays(analyses);
  const stays = pickDossierStays(dest, cfg, savedStays);
  const food = foodFor(dest);
  const transfers = transferWarnings(dest, plan);
  const activityCost = analyses.reduce((s, x) => s + x.a.cost, 0);
  const total = 2 + dayPages.length + 1;
  const endDate = dayDate(cfg.startDate, cfg.days - 1);

  const footer = `${dest.name} · ${occ.label}`;
  return (
    <div ref={ref} id={preview ? undefined : DOSSIER_ID}>
      {/* ───────── Page 1 — Cover & overview ───────── */}
      <Page n={1} total={total} footer={footer}>
        <div
          style={{
            margin: "-48px -52px 0",
            padding: "44px 52px 36px",
            background: `linear-gradient(135deg, ${C.marigold} 0%, ${C.rose} 60%, ${C.sage} 130%)`,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 3, fontWeight: 700, opacity: 0.9 }}>TRAVEL DOSSIER · {dest.regionName.toUpperCase()}</div>
          <div style={{ fontFamily: serif, fontSize: 46, fontWeight: 700, lineHeight: 1.05, marginTop: 10 }}>{dest.name}</div>
          {dest.aka && <div style={{ fontSize: 14, marginTop: 6, opacity: 0.95 }}>{dest.aka}</div>}
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 16, marginTop: 14, opacity: 0.95 }}>“{dest.tagline}”</div>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {[`${occ.emoji} ${occ.label}`, `${cfg.days} days`, `${PACE_META[cfg.pace].emoji} ${PACE_META[cfg.pace].label} pace`, `${cfg.travellers} traveller${cfg.travellers > 1 ? "s" : ""}`].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,0.22)", borderRadius: 999, padding: "5px 12px 7px", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 26 }}>
          {[
            ["Dates", cfg.startDate ? `${dayDate(cfg.startDate, 0)}${endDate ? ` – ${endDate}` : ""}` : "Flexible"],
            ["Best months", dest.idealMonths],
            ["Budget / person / day", inr(cfg.budget)],
            ["Est. trip budget", inr(cfg.budget * cfg.days * cfg.travellers)],
            ["Elevation", `${dest.elevation.toLocaleString("en-IN")} m`],
            ["Directory tier", TIER_LABEL[dest.tier]],
            ["Tickets & experiences", `${inr(activityCost)} pp`],
            ["State", dest.state],
          ].map(([k, v]) => (
            <div key={k} style={{ background: C.sand, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 9.5, color: C.soft, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, lineHeight: 1.3 }}>{v}</div>
            </div>
          ))}
        </div>

        <H2>Getting there</H2>
        <p style={{ fontSize: 12.5, color: C.soft, margin: 0 }}>{dest.gateway}</p>

        <H2>Trip at a glance</H2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {analyses.map(({ day, a }, i) => (
              <tr key={day.day} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: "7px 8px 7px 0", width: 92, fontWeight: 700, color: C.rose, verticalAlign: "top" }}>
                  Day {day.day}
                  {cfg.startDate && <div style={{ fontSize: 10, color: C.soft, fontWeight: 500 }}>{dayDate(cfg.startDate, i)}</div>}
                </td>
                <td style={{ padding: "7px 0", verticalAlign: "top" }}>
                  {a.schedule
                    .filter((s) => !s.activity.generic)
                    .slice(0, 3)
                    .map((s) => s.activity.name)
                    .join("  ·  ") || a.schedule.map((s) => s.activity.name).slice(0, 2).join("  ·  ")}
                </td>
                <td style={{ padding: "7px 0 7px 8px", width: 86, textAlign: "right", verticalAlign: "top" }}>
                  <LoadBadge load={a.load} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transfers.length > 0 && (
          <>
            <H2>Pacing notes</H2>
            {transfers.slice(0, 2).map((w) => (
              <Note key={w.id} tone="warn" title={w.title}>
                {w.detail}
              </Note>
            ))}
          </>
        )}

        {cfg.days <= 6 && transfers.length < 2 && (
          <>
        <H2>Why this plan works for {occ.short.toLowerCase()} trips</H2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.soft, lineHeight: 1.7 }}>
          {occ.priorities.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
          </>
        )}
      </Page>

      {/* ───────── Itinerary pages ───────── */}
      {dayPages.map((chunk, ci) => (
        <Page key={ci} n={2 + ci} total={total} footer={footer}>
          <PageTitle eyebrow="Day-by-day itinerary" title={ci === 0 ? "Your schedule" : "Schedule (continued)"} />
          {chunk.map(({ day, a }) => {
            const idx = day.day - 1;
            return (
              <div key={day.day} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: `2px solid ${C.ink}`, paddingBottom: 4 }}>
                  <div style={{ fontFamily: serif, fontSize: 19, fontWeight: 700 }}>
                    Day {day.day}
                    {cfg.startDate && <span style={{ fontSize: 13, color: C.soft, fontWeight: 500 }}> · {dayDate(cfg.startDate, idx)}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: C.soft }}>
                    {duration(a.activeMins)} plans · {duration(a.transitMins)} transit · ends ~{clock(a.endTime)}
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                  <tbody>
                    {a.schedule.map((s) => (
                      <tr key={s.item.uid} style={{ borderBottom: `1px solid ${C.line}` }}>
                        <td style={{ width: 78, padding: "8px 6px 8px 0", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 800 }}>{clock(s.start)}</div>
                          <div style={{ fontSize: 10, color: C.soft }}>
                            {SLOT_META[s.activity.slot].emoji} {SLOT_META[s.activity.slot].label}
                          </div>
                        </td>
                        <td style={{ padding: "8px 8px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 700, fontSize: 12.5 }}>{s.activity.name}</div>
                          <div style={{ fontSize: 10.5, color: C.soft, marginTop: 2, lineHeight: 1.45 }}>💡 {s.activity.tip}</div>
                          {s.transit && s.transit.mins >= 30 && (
                            <div style={{ fontSize: 10, color: C.rose, marginTop: 2 }}>
                              ↳ {duration(s.transit.mins)} from {s.transit.fromName}
                            </div>
                          )}
                        </td>
                        <td style={{ width: 92, padding: "8px 0", verticalAlign: "top", textAlign: "right", fontSize: 10.5, color: C.soft }}>
                          <div style={{ fontWeight: 700, color: C.ink }}>{duration(s.activity.durationMins)}</div>
                          <div>{s.activity.cost ? `${inr(s.activity.cost)} pp` : "Free"}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {a.warnings
                  .filter((w) => w.level !== "info")
                  .slice(0, 1)
                  .map((w) => (
                    <div key={w.id} style={{ fontSize: 10.5, color: C.rose, marginTop: 6 }}>
                      ⚠ {w.title} — {w.detail}
                    </div>
                  ))}
              </div>
            );
          })}
        </Page>
      ))}

      {/* ───────── Stays + transit cheat sheet ───────── */}
      <Page n={total - 1} total={total} footer={footer}>
        <PageTitle eyebrow="Where you'll sleep" title={stays.length ? "Stays & contacts" : "Stays"} />
        {stays.length === 0 && <p style={{ fontSize: 12, color: C.soft }}>Shortlist stays in the app to print their addresses here.</p>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {stays.map((s) => (
            <div key={s.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", background: C.sand }}>
              <div style={{ fontSize: 9.5, color: C.sage, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>{s.kind}</div>
              <div style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, marginTop: 2 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: C.soft, marginTop: 4, lineHeight: 1.5 }}>{s.address}</div>
              <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
                ☎ {s.phone}
                <br />⏰ Check-in {s.checkIn} · Check-out {s.checkOut}
                <br />★ {s.rating} ({s.reviewCount} reviews) · {inrRange(s.priceRange)} / {s.priceUnit}
              </div>
            </div>
          ))}
        </div>

        <H2>Transit cost cheat sheet</H2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: C.sand2, textAlign: "left" }}>
              <Th>Mode</Th>
              <Th>Typical cost</Th>
              <Th>Best for</Th>
              <Th>Insider tip</Th>
            </tr>
          </thead>
          <tbody>
            {dest.transit.map((t) => (
              <tr key={t.mode} style={{ borderBottom: `1px solid ${C.line}`, verticalAlign: "top" }}>
                <Td bold>{t.mode}</Td>
                <Td>{t.costRange}</Td>
                <Td>{t.bestFor}</Td>
                <Td muted>{t.tip}</Td>
              </tr>
            ))}
          </tbody>
        </table>

        <H2>Rentals</H2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: C.sand2, textAlign: "left" }}>
              <Th>Vehicle</Th>
              <Th>Per day</Th>
              <Th>Deposit</Th>
              <Th>Seats</Th>
              <Th>Note</Th>
            </tr>
          </thead>
          <tbody>
            {dest.rentals.map((r) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                <Td bold>{r.label}</Td>
                <Td>{inr(r.perDay)}</Td>
                <Td>{r.deposit ? inr(r.deposit) : "—"}</Td>
                <Td>{r.seats}</Td>
                <Td muted>{r.note}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Page>

      {/* ───────── Safety, food & essentials ───────── */}
      <Page n={total} total={total} footer={footer}>
        <PageTitle eyebrow="Keep this handy" title="Emergency & essentials" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {dest.emergency.map((e) => (
            <div key={e.label + e.number} style={{ display: "flex", gap: 10, alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.rose, minWidth: 64 }}>{e.number}</div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700 }}>{e.label}</div>
                {e.note && <div style={{ fontSize: 10, color: C.soft }}>{e.note}</div>}
              </div>
            </div>
          ))}
        </div>

        <H2>Scam alerts</H2>
        {dest.scams.slice(0, 4).map((s) => (
          <Note key={s} tone="warn">
            {s}
          </Note>
        ))}

        <H2>Train & bus tips</H2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11.5, color: C.soft, lineHeight: 1.6 }}>
          {dest.trainTips.slice(0, 3).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <H2>Must-eat checklist</H2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {food.dishes.slice(0, 4).map((d) => (
            <div key={d.id} style={{ fontSize: 11.5 }}>
              ☐ <b>{d.name}</b> <span style={{ color: C.soft }}>— {d.priceRange}</span>
            </div>
          ))}
          {food.spots.slice(0, 4).map((s) => (
            <div key={s.id} style={{ fontSize: 11.5 }}>
              ☐ <b>{s.name}</b> <span style={{ color: C.soft }}>— {s.area}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, padding: "12px 14px", borderRadius: 12, background: C.sand, fontSize: 11, color: C.soft, lineHeight: 1.6 }}>
          Generated free with RoamIndia — no login, no paywall. Timings, prices and permits change; confirm with operators before you travel. Save this PDF offline — mountain and island stretches often have no signal.
        </div>
      </Page>
    </div>
  );
});

function Page({ children, n, total, footer }: { children: ReactNode; n: number; total: number; footer: string }) {
  return (
    <section data-a4-page style={PAGE}>
      {children}
      <footer
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          bottom: 26,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: C.faint,
          borderTop: `1px solid ${C.line}`,
          paddingTop: 8,
        }}
      >
        <span>
          <b style={{ color: C.rose }}>RoamIndia</b> · {footer}
        </span>
        <span>
          Page {n} / {total}
        </span>
      </footer>
    </section>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, margin: "22px 0 8px" }}>{children}</h2>;
}

function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: 2.5, fontWeight: 800, color: C.rose, textTransform: "uppercase" }}>{eyebrow}</div>
      <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, marginTop: 2 }}>{title}</div>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th style={{ padding: "7px 8px", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, color: C.soft }}>{children}</th>;
}

function Td({ children, bold, muted }: { children: ReactNode; bold?: boolean; muted?: boolean }) {
  return <td style={{ padding: "7px 8px", fontWeight: bold ? 700 : 400, color: muted ? C.soft : C.ink, lineHeight: 1.45 }}>{children}</td>;
}

function Note({ children, title, tone }: { children: ReactNode; title?: string; tone: "warn" | "info" }) {
  return (
    <div
      style={{
        borderLeft: `3px solid ${tone === "warn" ? C.rose : C.sage}`,
        background: tone === "warn" ? "#fdf4f1" : "#f2f6f1",
        padding: "7px 10px",
        borderRadius: 6,
        fontSize: 11.5,
        marginBottom: 6,
        lineHeight: 1.5,
      }}
    >
      {title && <b>{title}. </b>}
      {children}
    </div>
  );
}

function LoadBadge({ load }: { load: number }) {
  const [bg, fg, label] = load > 115 ? ["#fbe6df", C.rose, "Overloaded"] : load > 100 ? ["#fef3c7", "#b45309", "Tight"] : load < 60 ? ["#e1eadf", C.sage, "Easy"] : ["#e1eadf", C.sage, "Balanced"];
  return <span style={{ background: bg, color: fg, borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700 }}>{label}</span>;
}
