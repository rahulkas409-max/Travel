"use client";

import { COLLECTIONS, TRENDING } from "@data/collections";
import { DESTINATIONS, DESTINATION_BY_ID } from "@data/destinations";
import { FARMHOUSES } from "@data/farmhouses";
import { OCCASION_BY_ID } from "@data/occasions";
import { REGIONS } from "@data/regions";
import type { Region } from "@data/types";
import { LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Dices, FileDown, Lock, MapPinned, Sparkles, Star, WifiOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Carousel } from "@/components/explore/Carousel";
import { DestinationCard } from "@/components/explore/DestinationCard";
import { WeatherCard } from "@/components/explore/WeatherCard";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";
import { destinationSource, keySource, propertySource } from "@/lib/imageSources";
import { HomeSearch } from "./HomeSearch";

function featuredOfTheDay() {
  const day = Math.floor(Date.now() / 86_400_000);
  return DESTINATION_BY_ID[TRENDING[day % TRENDING.length]];
}

export function HomePage() {
  const { destination, config, hydrated } = useTrip();
  // Server and first client render agree on a stable pick; rotate daily after mount.
  const [featured, setFeatured] = useState(DESTINATION_BY_ID[TRENDING[0]]);
  useEffect(() => setFeatured(featuredOfTheDay()), []);
  const [region, setRegion] = useState<Region>("north");

  const trending = useMemo(() => TRENDING.map((id) => DESTINATION_BY_ID[id]).filter(Boolean), []);
  const regional = useMemo(() => DESTINATIONS.filter((d) => d.region === region), [region]);
  const topFarms = useMemo(() => [...FARMHOUSES].sort((a, b) => b.rating - a.rating).slice(0, 8), []);

  return (
    <div className="space-y-14">
      {/* ───── Hero ───── */}
      <section className="relative left-1/2 -mt-6 w-screen -translate-x-1/2">
        <div className="relative h-[430px] overflow-hidden sm:h-[460px]">
          <SmartImage key={featured.id} source={destinationSource(featured)} width={1920} priority showCredit="top" className="absolute inset-0 h-full w-full" imgClassName="scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-[var(--bg)]" />
          <div className="relative mx-auto max-w-6xl px-4 pt-10 text-white sm:px-6 sm:pt-14">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-marigold-300" /> 100% free · no login · your data stays on your device
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Plan India your way.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              Honeymoons, office offsites, school trips and solo adventures — day-by-day plans, farmhouse stays, local food and a surprise-trip roulette.
            </motion.p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link href={`/destinations/${featured.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-white">
                📍 Today&apos;s pick: {featured.name} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <WeatherCard destinationId={featured.id} name={featured.name} compact />
            </div>
          </div>
        </div>
        <div className="relative -mt-40 px-4 sm:-mt-36 sm:px-6">
          <HomeSearch />
        </div>
      </section>

      {/* ───── Continue planning ───── */}
      {hydrated && (
        <Link href="/itinerary" className="glass group flex items-center gap-4 p-3 pr-5 transition hover:-translate-y-0.5">
          <SmartImage source={destinationSource(destination)} width={320} className="h-16 w-20 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Continue planning</p>
            <p className="truncate font-bold">
              {destination.name} · {config.days} days · {OCCASION_BY_ID[config.occasion].emoji} {OCCASION_BY_ID[config.occasion].short}
            </p>
            <p className="muted truncate text-xs">Saved on this device — pick up where you left off</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
        </Link>
      )}

      {/* ───── Trending ───── */}
      <Carousel title="Trending destinations" subtitle="Where travellers are heading this season" href="/destinations">
        {trending.map((d) => (
          <DestinationCard key={d.id} d={d} className="w-[230px] sm:w-[260px]" />
        ))}
      </Carousel>

      {/* ───── Collections ───── */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-[1.7rem]">Handpicked collections</h2>
            <p className="muted text-sm">Browse by what you&apos;re in the mood for</p>
          </div>
          <Link href="/destinations" className="text-sm font-bold text-rose-600 hover:underline dark:text-rose-300">
            All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLLECTIONS.map((c, i) => {
            const count = DESTINATIONS.filter(c.match).length;
            return (
              <Link
                key={c.id}
                href={`/destinations?c=${c.id}`}
                className={cn("group relative overflow-hidden rounded-3xl shadow-card transition hover:-translate-y-1", i < 2 ? "aspect-[4/3] sm:col-span-1" : "aspect-[4/3]")}
              >
                <SmartImage source={keySource("travel", c.title, c.id, [c.photo])} width={640} className="absolute inset-0 h-full w-full" imgClassName="transition duration-700 group-hover:scale-105" />
                <div className={cn("absolute inset-0 bg-gradient-to-t opacity-80 mix-blend-multiply", c.gradient)} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                  <p className="text-2xl leading-none">{c.emoji}</p>
                  <p className="mt-1 font-bold leading-tight">{c.title}</p>
                  <p className="text-[11px] text-white/80">
                    {c.subtitle} · {count} places
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───── Explore by region ───── */}
      <section>
        <h2 className="font-display text-2xl font-bold sm:text-[1.7rem]">Explore by region</h2>
        <LayoutGroup id="home-regions">
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  sound.play("tick", { intensity: 0.5 });
                  setRegion(r.id);
                }}
                className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition", region === r.id ? "text-white" : "glass !rounded-full hover:bg-white")}
              >
                {region === r.id && <motion.span layoutId="regionTab" className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white/15" />}
                <span className="relative">
                  {r.emoji} {r.short}
                </span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <p className="muted mt-2 text-sm">{REGIONS.find((r) => r.id === region)?.blurb}</p>
        <Carousel className="mt-2">
          {regional.map((d) => (
            <DestinationCard key={d.id} d={d} className="w-[200px] sm:w-[220px]" />
          ))}
        </Carousel>
      </section>

      {/* ───── Roulette banner ───── */}
      <Link href="/roulette" className="group relative block overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 via-rose-700 to-marigold-500 p-6 text-white shadow-lift sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[18px] border-white/10" />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full border-[14px] border-white/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-marigold-200">Mystery Roulette</p>
            <p className="mt-1 font-display text-3xl font-bold leading-tight">Decision fatigue? Spin for a surprise trip.</p>
            <p className="mt-1 text-sm text-white/80">4 vibe questions → a weighted wheel → confetti and a ready 3-day plan.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 py-3 font-bold text-slate-900 transition group-hover:scale-105 sm:self-auto">
            <Dices className="h-5 w-5" /> Play now
          </span>
        </div>
      </Link>

      {/* ───── Farmhouses ───── */}
      <Carousel title="Top-rated farmhouses & estates" subtitle="Agro-farms, pool farms, tea & coffee bungalows" href="/stays?tab=farm">
        {topFarms.map((p) => {
          const d = DESTINATION_BY_ID[p.destinationId];
          return (
            <Link key={p.id} href={`/destinations/${p.destinationId}#stays`} className="glass group w-[240px] shrink-0 snap-start overflow-hidden transition hover:-translate-y-1 sm:w-[270px]">
              <SmartImage source={propertySource(p, 0, d)} width={560} className="aspect-[4/3] w-full" imgClassName="transition duration-700 group-hover:scale-105">
                <span className="pill absolute left-2 top-2 bg-white/90 text-slate-900">{p.kind}</span>
              </SmartImage>
              <div className="p-3">
                <p className="truncate font-bold">{p.name}</p>
                <p className="muted truncate text-xs">
                  {p.neighbourhood} · {d?.name}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md bg-sage-500 px-1.5 py-0.5 font-bold text-white">
                    <Star className="h-3 w-3 fill-current" /> {p.rating.toFixed(1)}
                  </span>
                  <span className="font-bold">
                    {inr(p.priceRange[0])}
                    <span className="muted font-normal">/{p.priceUnit.split(" ")[0]}</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </Carousel>

      {/* ───── Why RoamIndia ───── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Lock, title: "No login, no paywall", body: "Everything is free and stays on your device." },
          { icon: MapPinned, title: "Pacing that's realistic", body: "Flags ghat delays, long transfers and missed sunsets." },
          { icon: FileDown, title: "One-tap A4 dossier", body: "Print-ready PDF with stays, transit & emergency numbers." },
          { icon: WifiOff, title: "Live & open data", body: "Wikipedia photos and Open-Meteo weather, cached for offline." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass flex gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-marigold-100 to-rose-100 text-rose-600 dark:from-marigold-500/20 dark:to-rose-500/20 dark:text-rose-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="muted text-sm">{body}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
