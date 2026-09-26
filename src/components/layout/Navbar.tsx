"use client";

import { LayoutGroup, motion } from "framer-motion";
import { BedDouble, CalendarRange, Compass, Dices, Moon, Share2, Sun, TrainFront, UtensilsCrossed, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn } from "@/lib/format";
import { DestinationSelector } from "./DestinationSelector";

export const NAV_ITEMS = [
  { href: "/", label: "Itinerary", short: "Plan", icon: CalendarRange },
  { href: "/stays", label: "Farmhouses & Stays", short: "Stays", icon: BedDouble },
  { href: "/roulette", label: "Mystery Roulette", short: "Surprise", icon: Dices },
  { href: "/food", label: "Food Radar", short: "Food", icon: UtensilsCrossed },
  { href: "/transit", label: "Transit", short: "Transit", icon: TrainFront },
  { href: "/export", label: "Export & Share", short: "Export", icon: Share2 },
] as const;

const spring = { type: "spring", stiffness: 480, damping: 38 } as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { muted, toggleMute, theme, setTheme } = useTrip();

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setIsDark(el.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [theme]);

  return (
    <>
      <header
        className="no-print sticky top-0 z-50 border-b border-[var(--line)] bg-[rgb(var(--bg-rgb)/0.90)] backdrop-blur-xl"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="RoamIndia home" onClick={() => sound.unlock()}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-marigold-500 via-rose-500 to-sage-500 text-white shadow-lift">
              <Compass className="h-5 w-5" />
            </span>
            <span className="hidden font-display text-xl font-bold tracking-tight sm:inline">
              Roam<span className="text-rose-500">India</span>
            </span>
          </Link>

          <div className="min-w-0 flex-1 sm:flex-none">
            <DestinationSelector compact />
          </div>

          <LayoutGroup id="top-nav">
            <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Main">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => sound.play("tick", { intensity: 0.5 })}
                    className={cn("relative rounded-full px-3 py-2 text-sm font-medium transition", active ? "text-white" : "opacity-75 hover:opacity-100")}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && <motion.span layoutId="topNavPill" transition={spring} className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white/15" />}
                    <span className="relative">{item.short}</span>
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-2">
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
          </div>
        </div>
      </header>

      {/* Bottom tab bar — phones & portrait tablets */}
      <LayoutGroup id="bottom-nav">
        <nav
          className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[rgb(var(--bg-rgb)/0.95)] backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: "var(--safe-bottom)" }}
          aria-label="Main"
        >
          <div className="mx-auto grid max-w-2xl grid-cols-6 px-1">
            {NAV_ITEMS.map((item) => {
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
                  className="relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[10px] font-semibold"
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span layoutId="bottomNavPill" transition={spring} className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl bg-gradient-to-b from-marigold-500/15 to-rose-500/15" />
                  )}
                  <Icon className={cn("relative h-5 w-5 transition", active ? "text-rose-500" : "opacity-60")} strokeWidth={active ? 2.4 : 2} />
                  <span className={cn("relative", active ? "text-rose-600 dark:text-rose-300" : "opacity-70")}>{item.short}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </LayoutGroup>
    </>
  );
}
