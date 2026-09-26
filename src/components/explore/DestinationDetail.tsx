"use client";

import { ABOUT_WIKI, GEO } from "@data/geo";
import { DESTINATIONS } from "@data/destinations";
import { OCCASIONS, OCCASION_BY_ID } from "@data/occasions";
import type { Occasion } from "@data/types";
import { motion } from "framer-motion";
import { CalendarDays, Camera, Clock, Flame, IndianRupee, MapPin, Mountain, Plane, Sprout, Star, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePhotoViewer } from "@/components/export/ImageDownloadModal";
import { TierBadge } from "@/components/layout/DestinationSelector";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { farmsFor, foodFor, getDestination, staysFor } from "@/lib/destinations";
import { cn, duration, inr } from "@/lib/format";
import { activitySource, destinationSource, dishSource, propertySource } from "@/lib/imageSources";
import { SLOT_META } from "@/lib/itinerary";
import { distanceKm, stayLinks, travelLinks } from "@/lib/links";
import { searchCommons } from "@/lib/openData";
import { Carousel } from "./Carousel";
import { DestinationCard } from "./DestinationCard";
import { LiveLinks } from "./LiveLinks";
import { WeatherCard } from "./WeatherCard";
import { WikiAbout } from "./WikiAbout";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "experiences", label: "Experiences" },
  { id: "stays", label: "Stays" },
  { id: "food", label: "Food" },
  { id: "getting-there", label: "Getting there" },
];

export function DestinationDetail({ id }: { id: string }) {
  const d = getDestination(id);
  const router = useRouter();
  const { config, applyTrip, setDestination } = useTrip();
  const { openPhoto } = usePhotoViewer();
  const [occasion, setOccasion] = useState<Occasion>(d.occasions.includes(config.occasion) ? config.occasion : d.occasions[0]);
  const [days, setDays] = useState(Math.round((d.idealDays[0] + d.idealDays[1]) / 2));
  const [galleryCount, setGalleryCount] = useState(0);

  useEffect(() => {
    let live = true;
    searchCommons(GEO[d.id]?.wiki ?? d.name).then((r) => live && setGalleryCount(r.length));
    return () => {
      live = false;
    };
  }, [d.id, d.name]);

  const stays = useMemo(() => [...farmsFor(d.id), ...staysFor(d.id)].sort((a, b) => b.rating - a.rating), [d.id]);
  const food = useMemo(() => foodFor(d), [d]);
  const nearby = useMemo(
    () =>
      DESTINATIONS.filter((x) => x.id !== d.id)
        .map((x) => ({ x, km: distanceKm(d.id, x.id) }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 8),
    [d.id],
  );
  const highlights = d.highlights.filter((h) => h.occasions.includes(occasion)).concat(d.highlights.filter((h) => !h.occasions.includes(occasion)));
  const occ = OCCASION_BY_ID[occasion];

  const plan = () => {
    sound.unlock();
    sound.play("whoosh");
    applyTrip({ destinationId: d.id, occasion, days });
    router.push("/itinerary");
  };

  const gallery = [0, 1, 2, 3, 4].map((i) => destinationSource(d, i));

  return (
    <div className="space-y-10">
      {/* ───── Gallery hero (MMT hotel-page style) ───── */}
      <section className="-mx-4 -mt-6 sm:mx-0 sm:mt-0">
        <div className="grid h-[320px] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden sm:h-[420px] sm:rounded-3xl">
          {gallery.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openPhoto({ source: src, label: d.name, caption: `${d.state} · open-licensed photo` })}
              className={cn("group relative overflow-hidden", i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block", i > 2 && "sm:block")}
            >
              <SmartImage source={src} width={i === 0 ? 1600 : 640} priority={i === 0} showCredit={i === 0} className="absolute inset-0 h-full w-full" imgClassName="transition duration-700 group-hover:scale-105" />
              {i === 4 && galleryCount > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">
                  <Camera className="mr-1.5 h-4 w-4" /> Tap to save photos
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ───── Title + booking-style sidebar ───── */}
      <section id="overview" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <TierBadge tier={d.tier} />
              <span className="pill bg-black/5 dark:bg-white/10">
                {d.regionName}
              </span>
              {d.farmhouseHub && (
                <span className="pill bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300">
                  <Sprout className="h-3 w-3" /> Farmhouse hub
                </span>
              )}
            </div>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">{d.name}</h1>
            {d.aka && <p className="muted mt-1 text-sm">{d.aka}</p>}
            <p className="mt-2 font-display text-lg italic">“{d.tagline}”</p>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Fact icon={Sun} label="Best time" value={d.idealMonths.split("·")[0].trim()} />
            <Fact icon={Mountain} label="Elevation" value={`${d.elevation.toLocaleString("en-IN")} m`} />
            <Fact icon={CalendarDays} label="Ideal stay" value={`${d.idealDays[0]}–${d.idealDays[1]} days`} />
            <Fact icon={MapPin} label="State" value={d.state} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {d.tags.map((t) => (
              <span key={t} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-medium">
                #{t}
              </span>
            ))}
          </div>

          <div className="glass p-5">
            <h2 className="mb-2 font-display text-xl font-bold">About {d.name}</h2>
            <WikiAbout title={ABOUT_WIKI[d.id] ?? GEO[d.id]?.wiki ?? d.name} fallback={d.tagline} />
          </div>

          <WeatherCard destinationId={d.id} name={d.name} />
        </div>

        {/* Sticky plan card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass-strong space-y-4 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">Plan this trip</p>
              <p className="mt-1 text-sm">Pick who&apos;s travelling — the itinerary, stays and pacing adapt.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((o) => {
                const fit = d.occasions.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      sound.play("tick");
                      setOccasion(o.id);
                    }}
                    className={cn(
                      "rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold transition",
                      occasion === o.id ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-[var(--line)] hover:bg-white/60 dark:hover:bg-white/5",
                    )}
                  >
                    {o.emoji} {o.short}
                    <span className={cn("block text-[10px] font-medium", fit ? "text-sage-600 dark:text-sage-300" : "muted")}>{fit ? "Great fit" : "Possible"}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-3 py-2">
              <span className="text-sm font-semibold">Days</span>
              <div className="flex items-center gap-2">
                <button type="button" className="icon-btn !h-8 !w-8" onClick={() => setDays((n) => Math.max(1, n - 1))} aria-label="Fewer days">
                  −
                </button>
                <span className="w-6 text-center text-lg font-extrabold tabular-nums">{days}</span>
                <button type="button" className="icon-btn !h-8 !w-8" onClick={() => setDays((n) => Math.min(10, n + 1))} aria-label="More days">
                  +
                </button>
              </div>
            </div>
            <button type="button" onClick={plan} className="btn-primary w-full !min-h-[52px] text-base">
              Plan my {days}-day {occ.short.toLowerCase()} trip →
            </button>
            <p className="muted text-center text-xs">Free · no login · editable day-by-day</p>
          </div>
        </aside>
      </section>

      {/* ───── Section nav ───── */}
      <nav className="no-scrollbar glass-strong sticky top-[4.6rem] z-30 -mx-1 flex gap-1 overflow-x-auto p-1 sm:top-[5rem]" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold opacity-80 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10">
            {s.label}
          </a>
        ))}
      </nav>

      {/* ───── Experiences ───── */}
      <section id="experiences" className="scroll-mt-40">
        <h2 className="font-display text-2xl font-bold">Top experiences</h2>
        <p className="muted text-sm">Sorted for {occ.emoji} {occ.short.toLowerCase()} trips · insider tips from locals</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, i) => (
            <motion.article key={h.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 5) * 0.04 }} className="glass overflow-hidden">
              <button type="button" onClick={() => openPhoto({ source: activitySource(h, d), label: h.name, caption: d.name })} className="relative block w-full">
                <SmartImage source={activitySource(h, d)} width={640} className="aspect-[16/10] w-full" />
                <span className="pill absolute left-2 top-2 bg-white/90 text-slate-900">
                  {SLOT_META[h.slot].emoji} {SLOT_META[h.slot].label}
                </span>
              </button>
              <div className="p-3.5">
                <h3 className="font-bold leading-snug">{h.name}</h3>
                <p className="muted mt-1 flex gap-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {duration(h.durationMins)}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <IndianRupee className="h-3 w-3" /> {h.cost ? inr(h.cost).slice(1) : "Free"}
                  </span>
                  <span>{h.occasions.map((o) => OCCASION_BY_ID[o].emoji).join(" ")}</span>
                </p>
                <p className="mt-2 text-sm leading-snug">
                  <span className="hand font-bold text-rose-600 dark:text-rose-300">Tip: </span>
                  {h.tip}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ───── Stays ───── */}
      <section id="stays" className="scroll-mt-40 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Where to stay</h2>
            <p className="muted text-sm">{stays.length ? "Curated farmhouses, estates & stays with review breakdowns" : "Compare live availability on trusted platforms"}</p>
          </div>
          {stays.length > 0 && (
            <Link href="/stays" onClick={() => setDestination(d.id)} className="text-sm font-bold text-rose-600 hover:underline dark:text-rose-300">
              All stays →
            </Link>
          )}
        </div>
        {stays.length > 0 && (
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {stays.map((p) => (
              <Link key={p.id} href="/stays" onClick={() => setDestination(d.id)} className="glass w-[250px] shrink-0 overflow-hidden transition hover:-translate-y-1">
                <SmartImage source={propertySource(p, 0, d)} width={560} className="aspect-[4/3] w-full">
                  <span className="pill absolute left-2 top-2 bg-white/90 text-slate-900">{p.kind}</span>
                </SmartImage>
                <div className="p-3">
                  <p className="truncate font-bold">{p.name}</p>
                  <p className="muted truncate text-xs">{p.neighbourhood}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 rounded-md bg-sage-500 px-1.5 py-0.5 font-bold text-white">
                      <Star className="h-3 w-3 fill-current" /> {p.rating.toFixed(1)} · {p.reviewCount}
                    </span>
                    <span className="font-bold">{inr(p.priceRange[0])}+</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <LiveLinks
          title={`Live availability in ${d.name}`}
          note={`Opens each site's own search for your dates (${config.days} nights, ${config.travellers} guests). Prices & reviews there are live.`}
          links={stayLinks(d, { startDate: config.startDate, nights: config.days, guests: config.travellers, farm: d.farmhouseHub })}
        />
      </section>

      {/* ───── Food ───── */}
      <section id="food" className="scroll-mt-40">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">What to eat</h2>
            <p className="muted text-sm">{food.regional ? `${d.regionName} staples` : food.intro}</p>
          </div>
          <Link href="/food" onClick={() => setDestination(d.id)} className="text-sm font-bold text-rose-600 hover:underline dark:text-rose-300">
            Food radar →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {food.dishes.slice(0, 4).map((dish) => (
            <div key={dish.id} className="glass overflow-hidden">
              <SmartImage source={dishSource(dish)} width={480} className="aspect-[4/3] w-full" />
              <div className="p-3">
                <p className="font-bold leading-tight">{dish.name}</p>
                <p className="muted mt-1 flex items-center justify-between text-xs">
                  <span className="inline-flex">
                    {[1, 2, 3].map((n) => (
                      <Flame key={n} className={cn("h-3 w-3", n <= dish.spice ? "fill-rose-500 text-rose-500" : "opacity-30")} />
                    ))}
                  </span>
                  {dish.priceRange}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Getting there ───── */}
      <section id="getting-there" className="scroll-mt-40 space-y-4">
        <h2 className="font-display text-2xl font-bold">Getting there & around</h2>
        <div className="glass flex items-start gap-3 p-4">
          <Plane className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">Gateway</p>
            <p className="font-semibold">{d.gateway}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {d.transit.slice(0, 4).map((t) => (
            <div key={t.mode} className="glass p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-bold">{t.mode}</p>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-300">{t.costRange}</p>
              </div>
              <p className="muted mt-1 text-sm">{t.tip}</p>
            </div>
          ))}
        </div>
        <LiveLinks title="Book your travel" links={travelLinks(d)} />
      </section>

      {/* ───── Nearby ───── */}
      <Carousel title="Nearby destinations" subtitle="Combine them into a longer circuit">
        {nearby.map(({ x, km }) => (
          <div key={x.id} className="w-[200px] shrink-0 snap-start">
            <DestinationCard d={x} className="w-full" />
            <p className="muted mt-1 text-center text-xs">~{km.toLocaleString("en-IN")} km away</p>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Sun; label: string; value: string }) {
  return (
    <div className="glass p-3">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 text-sm font-bold leading-tight">{value}</p>
    </div>
  );
}
