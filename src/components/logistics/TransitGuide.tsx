"use client";

import type { TransitOption } from "@data/types";
import { motion } from "framer-motion";
import { Bike, Bus, Car, Footprints, Plane, Ship, ShieldAlert, Siren, TrainFront, TramFront, Truck, Phone, Route } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTrip } from "@/context/TripContext";
import { cn, duration } from "@/lib/format";
import { RentalEstimator } from "./RentalEstimator";
import { LiveLinks } from "@/components/explore/LiveLinks";
import { travelLinks } from "@/lib/links";
import { DateRange } from "@/components/ui/DateRange";

const ICONS: Record<TransitOption["icon"], typeof Car> = {
  cab: Car,
  scooty: Bike,
  bike: Bike,
  bus: Bus,
  train: TrainFront,
  flight: Plane,
  boat: Ship,
  auto: Truck,
  walk: Footprints,
  jeep: Truck,
  metro: TramFront,
};

export function TransitGuide() {
  const { destination: dest, config, setStartDate, setDays } = useTrip();
  const links = dest.zoneLinks;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Transit & Logistics" title={<>Getting around {dest.name}</>} destination>
        Cabs, buses, scooty rentals and train hacks — plus the transit-friction map our pacing meter uses and the scams locals warn about.
      </PageHeader>

      <section className="glass flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-marigold-500 to-rose-500 text-white">
          <Plane className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60">Gateway</p>
          <p className="font-semibold">{dest.gateway}</p>
        </div>
      </section>

      <LiveLinks title="Book flights, trains & buses" note="Opens the official / major booking sites in a new tab." links={travelLinks(dest, config.startDate, config.days)}>
        <DateRange
          variant="pill"
          labels={["Departure", "Return"]}
          start={config.startDate}
          length={config.days}
          onChange={(st, len) => {
            if (st !== config.startDate) setStartDate(st);
            if (len !== config.days) setDays(len);
          }}
        />
      </LiveLinks>

      <section>
        <h2 className="section-title mb-4">Ways to move</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {dest.transit.map((t, i) => {
            const Icon = ICONS[t.icon];
            return (
              <motion.article key={t.mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <h3 className="font-semibold">{t.mode}</h3>
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{t.costRange}</span>
                    </div>
                    <p className="muted text-xs">Best for: {t.bestFor}</p>
                    <p className="mt-2 text-sm">{t.tip}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {links.length > 0 && (
        <section>
          <h2 className="section-title mb-1">
            <Route className="mr-1 inline h-5 w-5 text-marigold-500" /> Transit friction map
          </h2>
          <p className="muted mb-4 text-sm">Door-to-door times between areas. Anything over 90 minutes gets flagged in your itinerary.</p>
          <div className="glass divide-y divide-[var(--line)]">
            {links.map((l) => {
              const from = dest.zones.find((z) => z.id === l.from)?.name ?? l.from;
              const to = dest.zones.find((z) => z.id === l.to)?.name ?? l.to;
              const tone = l.mins >= 140 ? "bg-rose-500" : l.mins >= 90 ? "bg-marigold-500" : "bg-sage-500";
              return (
                <div key={`${l.from}-${l.to}`} className="p-4">
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 text-sm font-semibold">
                      {from} <span className="opacity-40">⇄</span> {to}
                    </p>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold text-white", tone)}>{duration(l.mins)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <motion.div className={cn("h-full rounded-full", tone)} initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, (l.mins / 360) * 100)}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                  </div>
                  {l.note && <p className="muted mt-1.5 text-xs">{l.note}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <RentalEstimator />

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="section-title mb-3">🚆 Train & bus tips</h2>
          <ul className="glass space-y-3 p-4 text-sm">
            {dest.trainTips.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-marigold-500">▸</span>
                {t}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="section-title mb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" /> Scam alerts
          </h2>
          <ul className="space-y-2">
            {dest.scams.map((s) => (
              <li key={s} className="rounded-2xl border border-rose-300/60 bg-rose-50/80 p-3 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
                ⚠️ {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="section-title mb-3 flex items-center gap-2">
          <Siren className="h-5 w-5 text-rose-500" /> Emergency numbers
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dest.emergency.map((e) => (
            <a key={e.label + e.number} href={`tel:${e.number.replace(/[^0-9]/g, "")}`} className="glass flex min-w-0 items-center gap-3 p-3 transition hover:-translate-y-0.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                <Phone className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold leading-tight">{e.number}</span>
                <span className="block text-xs font-semibold">{e.label}</span>
                {e.note && <span className="muted block truncate text-[11px]">{e.note}</span>}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
