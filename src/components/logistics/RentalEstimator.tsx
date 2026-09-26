"use client";

import { motion } from "framer-motion";
import { Calculator, Fuel } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";

const FUEL_PRICE = 103; // ₹ per litre petrol, approximate national average

/** Estimate rental + fuel for scooties, bikes, cars or group tempo travellers. */
export function RentalEstimator() {
  const { destination: dest, config } = useTrip();
  const [vehicleId, setVehicleId] = useState(dest.rentals[0]?.id);
  const [days, setDays] = useState(config.days);
  const [people, setPeople] = useState(config.travellers);
  const [kmPerDay, setKmPerDay] = useState(60);

  useEffect(() => setVehicleId(dest.rentals[0]?.id), [dest.id, dest.rentals]);
  useEffect(() => setDays(config.days), [config.days]);
  useEffect(() => setPeople(config.travellers), [config.travellers]);

  const v = dest.rentals.find((r) => r.id === vehicleId) ?? dest.rentals[0];

  const est = useMemo(() => {
    if (!v) return null;
    const units = Math.max(1, Math.ceil(people / v.seats));
    const rent = v.perDay * days * units;
    const fuel = v.mileage ? Math.round(((kmPerDay * days) / v.mileage) * FUEL_PRICE * units) : 0;
    const deposit = v.deposit * units;
    const total = rent + fuel;
    return { units, rent, fuel, deposit, total, perPerson: Math.round(total / Math.max(1, people)) };
  }, [v, people, days, kmPerDay]);

  if (!v || !est) return null;

  return (
    <div className="glass p-5">
      <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
        <Calculator className="h-5 w-5 text-marigold-500" /> Rental estimator
      </h3>
      <p className="muted mt-1 text-sm">Typical {dest.regionName} rates — negotiate for 3+ days.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {dest.rentals.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              sound.play("tick");
              setVehicleId(r.id);
            }}
            className={cn(
              "rounded-2xl border p-3 text-left transition",
              r.id === v.id ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-[var(--line)] hover:bg-white/60 dark:hover:bg-white/5",
            )}
            aria-pressed={r.id === v.id}
          >
            <p className="text-sm font-semibold leading-tight">{r.label}</p>
            <p className="muted mt-1 text-xs">
              {inr(r.perDay)}/day · {r.seats} seats
            </p>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Range label="Days" value={days} min={1} max={14} onChange={setDays} />
        <Range label="People" value={people} min={1} max={60} onChange={setPeople} />
        {v.mileage ? <Range label="Km / day" value={kmPerDay} min={10} max={300} step={10} onChange={setKmPerDay} /> : <p className="muted self-end text-xs">Driver & fuel included in the day rate (usually 250 km/day cap).</p>}
      </div>

      <motion.div key={`${v.id}-${est.total}`} initial={{ scale: 0.98, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="mt-5 grid gap-3 rounded-2xl bg-slate-900 p-4 text-white sm:grid-cols-4 dark:bg-white/10">
        <Out label={`Rent × ${est.units}`} value={inr(est.rent)} />
        <Out label="Fuel" value={est.fuel ? inr(est.fuel) : "Included"} icon={<Fuel className="h-3.5 w-3.5" />} />
        <Out label="Refundable deposit" value={est.deposit ? inr(est.deposit) : "—"} />
        <Out label="Per person" value={inr(est.perPerson)} highlight />
      </motion.div>
      <p className="muted mt-2 text-xs">{v.note}. Fuel at ~₹{FUEL_PRICE}/L. Always photograph the vehicle before riding out.</p>
    </div>
  );
}

function Range({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-semibold">
        <span className="opacity-70">{label}</span>
        <span className="tabular-nums">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" />
    </label>
  );
}

function Out({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
        {icon} {label}
      </p>
      <p className={cn("mt-0.5 text-lg font-bold tabular-nums", highlight && "text-marigold-400")}>{value}</p>
    </div>
  );
}
