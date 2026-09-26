"use client";

import { LayoutGroup, motion } from "framer-motion";
import {
  BedDouble,
  CalendarRange,
  Dices,
  Grid2x2,
  House,
  Map,
  Moon,
  Share2,
  Sun,
  TrainFront,
  UtensilsCrossed,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn } from "@/lib/format";
import { Logo } from "@/components/ui/Logo";

export const NAV_ITEMS = [
  { href: "/", label: "Home", short: "Home", icon: House, blurb: "Search & inspiration" },
  { href: "/destinations", label: "Destinations", short: "Explore", icon: Map, blurb: "68 places, 6 regions" },
  { href: "/itinerary", label: "Itinerary", short: "Plan", icon: CalendarRange, blurb: "Day-by-day planner" },
  { href: "/stays", label: "Farmhouses & Stays", short: "Stays", icon: BedDouble, blurb: "Farms, villas, hostels" },
  { href: "/roulette", label: "Mystery Roulette", short: "Surprise", icon: Dices, blurb: "Quiz + spin the wheel" },
  { href: "/food", label: "Food Radar", short: "Food", icon: UtensilsCrossed, blurb: "Dishes & legendary spots" },
  { href: "/transit", label: "Transit", short: "Transit", icon: TrainFront, blurb: "Cabs, trains, rentals" },
  { href: "/export", label: "Export & Share", short: "Export", icon: Share2, blurb: "PDF, WhatsApp, photos" },
] as const;

const BOTTOM = ["/", "/itinerary", "/stays", "/roulette"];

const BUSINESS_LINKS = [
  { href: "/pricing", label: "Pricing", blurb: "Free for travellers" },
  { href: "/partner", label: "List your property", blurb: "Farmhouses & homestays" },
  { href: "/pro", label: "Organiser Pro", blurb: "Schools, HR & agents" },
];
const spring = { type: "spring", stiffness: 480, damping: 38 } as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { muted, toggleMute, theme, setTheme } = useTrip();
  const [isDark, setIsDark] = useState(false);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setIsDark(el.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [theme]);

  useEffect(() => setMore(false), [pathname]);

  const moreActive = !BOTTOM.some((h) => isActive(pathname, h));

  const toggles = (
    <>
      <button
        type="button"
        onClick={() => {
          sound.unlock();
          toggleMute();
        }}
        className="icon-btn"
        aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
        aria-pressed={muted}
      >
        {muted ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume2 className="h-[18px] w-[18px]" />}
      </button>
      <button
        type="button"
        onClick={() => {
          sound.play("pop");
          setTheme(isDark ? "light" : "dark");
        }}
        className="icon-btn"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <Sun className="hidden h-[18px] w-[18px] dark:block" />
        <Moon className="h-[18px] w-[18px] dark:hidden" />
      </button>
    </>
  );

  return (
    <>
      <header className="no-print sticky top-0 z-50 border-b border-[var(--line)] bg-[rgb(var(--bg-rgb)/0.92)] backdrop-blur-xl" style={{ paddingTop: "var(--safe-top)" }}>
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="RoamIndia home" onClick={() => sound.unlock()}>
            <Logo />
          </Link>

          <LayoutGroup id="top-nav">
            <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Main">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => sound.play("tick", { intensity: 0.5 })}
                    className={cn("relative rounded-full px-3 py-2 text-sm font-semibold transition", active ? "text-white" : "opacity-75 hover:opacity-100")}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && <motion.span layoutId="topNavPill" transition={spring} className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white/15" />}
                    <span className="relative">{item.short}</span>
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 xl:ml-2">{toggles}</div>
        </div>
      </header>

      {/* Bottom tab bar — phones & tablets (5 fixed slots so nothing can overflow) */}
      <LayoutGroup id="bottom-nav">
        <nav
          className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[rgb(var(--bg-rgb)/0.96)] backdrop-blur-xl xl:hidden"
          style={{ paddingBottom: "var(--safe-bottom)" }}
          aria-label="Main"
        >
          <div className="mx-auto grid max-w-xl grid-cols-5 px-1">
            {NAV_ITEMS.filter((i) => BOTTOM.includes(i.href)).map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    sound.unlock();
                    sound.play("tick", { intensity: 0.5 });
                  }}
                  className="relative flex min-h-[60px] min-w-0 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold"
                  aria-current={active ? "page" : undefined}
                >
                  {active && <motion.span layoutId="bottomNavPill" transition={spring} className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl bg-gradient-to-b from-marigold-500/15 to-rose-500/15" />}
                  <Icon className={cn("relative h-5 w-5 transition", active ? "text-rose-500" : "opacity-60")} strokeWidth={active ? 2.4 : 2} />
                  <span className={cn("relative truncate", active ? "text-rose-600 dark:text-rose-300" : "opacity-70")}>{item.short}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                sound.play("pop");
                setMore(true);
              }}
              className="relative flex min-h-[60px] min-w-0 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold"
              aria-haspopup="dialog"
            >
              {moreActive && <motion.span layoutId="bottomNavPill" transition={spring} className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl bg-gradient-to-b from-marigold-500/15 to-rose-500/15" />}
              <Grid2x2 className={cn("relative h-5 w-5", moreActive ? "text-rose-500" : "opacity-60")} />
              <span className={cn("relative", moreActive ? "text-rose-600 dark:text-rose-300" : "opacity-70")}>More</span>
            </button>
          </div>
        </nav>
      </LayoutGroup>

      <Sheet open={more} onClose={() => setMore(false)} title="Everything in RoamIndia" subtitle="Free forever · no login">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => sound.play("tick")}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border p-3.5 transition",
                  active ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-[var(--line)] bg-white/60 hover:bg-white dark:bg-white/[0.04]",
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-marigold-400 to-rose-500 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="muted block text-xs">{item.blurb}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {BUSINESS_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-2xl border border-[var(--line)] p-3 text-center transition hover:bg-white/60 dark:hover:bg-white/5">
              <span className="block text-xs font-bold">{l.label}</span>
              <span className="muted block text-[10px]">{l.blurb}</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-[var(--line)] p-3">
          <span className="text-sm font-semibold">Sound & theme</span>
          <div className="flex gap-2">{toggles}</div>
        </div>
      </Sheet>
    </>
  );
}
