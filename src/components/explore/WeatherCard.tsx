"use client";

import { GEO } from "@data/geo";
import { CloudOff, Droplets, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";
import { getForecast, weatherLabel, type Forecast } from "@/lib/openData";

/** Live 7-day forecast from Open-Meteo (free, no key). */
export function WeatherCard({ destinationId, name, compact = false, className }: { destinationId: string; name: string; compact?: boolean; className?: string }) {
  const g = GEO[destinationId];
  const [data, setData] = useState<Forecast | null | undefined>(undefined);

  useEffect(() => {
    if (!g) return setData(null);
    let live = true;
    setData(undefined);
    getForecast(g.lat, g.lon).then((f) => live && setData(f));
    return () => {
      live = false;
    };
  }, [g]);

  // The compact hero chip simply stays hidden while loading or when offline.
  if (compact && !data) return null;

  if (data === undefined)
    return <div className={cn("glass shimmer h-44", className)} aria-label="Loading weather" />;

  if (!data)
    return (
      <div className={cn("glass flex items-center gap-3 p-4 text-sm", className)}>
        <CloudOff className="h-5 w-5 opacity-50" />
        <span className="muted">Live weather is unavailable right now — check again when you&apos;re online.</span>
      </div>
    );

  const now = weatherLabel(data.current.code, data.current.isDay);

  if (compact)
    return (
      <div className={cn("inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur", className)}>
        <span className="text-lg leading-none">{now.emoji}</span> {data.current.temp}°C · {now.label}
      </div>
    );

  return (
    <div className={cn("glass p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60">Live weather · {name}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl">{now.emoji}</span>
            <span className="text-3xl font-bold tabular-nums">{data.current.temp}°</span>
            <span className="muted text-sm">{now.label}</span>
          </p>
        </div>
        <div className="muted space-y-1 text-right text-xs">
          <p className="inline-flex items-center gap-1">
            <Wind className="h-3.5 w-3.5" /> {data.current.wind} km/h
          </p>
          <p className="flex items-center justify-end gap-1">
            <Droplets className="h-3.5 w-3.5" /> {data.current.humidity}%
          </p>
        </div>
      </div>
      <div className="no-scrollbar mt-3 grid grid-cols-7 gap-1 text-center text-[11px]">
        {data.daily.map((d, i) => {
          const w = weatherLabel(d.code);
          return (
            <div key={d.date} className={cn("rounded-xl py-2", i === 0 ? "bg-marigold-100/80 dark:bg-marigold-500/15" : "bg-black/[0.03] dark:bg-white/5")}>
              <p className="font-semibold">{i === 0 ? "Today" : new Date(`${d.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}</p>
              <p className="my-0.5 text-lg leading-none">{w.emoji}</p>
              <p className="font-bold tabular-nums">{d.max}°</p>
              <p className="muted tabular-nums">{d.min}°</p>
              {d.rainChance >= 30 && <p className="text-sky-600 dark:text-sky-300">{d.rainChance}%</p>}
            </div>
          );
        })}
      </div>
      <p className="muted mt-2 text-[10px]">Forecast by Open-Meteo · updates hourly</p>
    </div>
  );
}
