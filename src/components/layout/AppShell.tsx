"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DossierHost } from "@/components/export/PrintDossier";
import { PhotoViewerProvider } from "@/components/export/ImageDownloadModal";
import { EnquiryProvider } from "@/components/money/EnquiryModal";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BUSINESS } from "@/config/business";
import { Toaster } from "@/components/ui/Toaster";
import { TripProvider, useTrip } from "@/context/TripContext";
import { FloatingOccasionBar } from "./FloatingOccasionBar";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TripProvider>
      <PhotoViewerProvider>
        <EnquiryProvider>
        <div className="app-shell flex min-h-dvh flex-col">
          <a href="#main" className="sr-only z-[100] rounded-xl bg-slate-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
            Skip to content
          </a>
          <Navbar />
          <VibeBarSlot />
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 outline-none px-4 pb-32 pt-6 sm:px-6 xl:pb-16">{children}</main>
          <Footer />
        </div>
        <Toaster />
        <DossierHost />
        </EnquiryProvider>
      </PhotoViewerProvider>
    </TripProvider>
  );
}

/** The floating Vibe Bar only appears where it changes what you see (planner & stays). */
function VibeBarSlot() {
  const pathname = usePathname();
  if (!["/itinerary", "/stays", "/export"].some((p) => pathname.startsWith(p))) return null;
  return (
    <div className="pt-3">
      <FloatingOccasionBar />
    </div>
  );
}

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: "Plan", links: [["/itinerary", "Itinerary planner"], ["/destinations", "All destinations"], ["/roulette", "Surprise me"], ["/export", "PDF & WhatsApp"]] },
  { title: "Explore", links: [["/stays", "Farmhouses & stays"], ["/food", "Food radar"], ["/transit", "Transit & emergency"], ["/destinations?c=offbeat", "Off-beat India"]] },
  { title: "For business", links: [["/pricing", "Pricing"], ["/partner", "List your property"], ["/pro", "Organiser Pro"], ["/disclosure", "How we make money"]] },
  { title: "Help & legal", links: [["/contact", "Contact & grievances"], ["/privacy", "Privacy policy"], ["/terms", "Terms of use"], ["/refunds", "Cancellation & refunds"]] },
];

function Footer() {
  const { resetEverything } = useTrip();
  return (
    <footer className="no-print mt-8 border-t border-[var(--line)] bg-white/40 dark:bg-white/[0.02]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-10 sm:px-6 xl:pb-10">
        <div className="grid gap-8 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="space-y-3">
            <Logo />
            <p className="muted max-w-xs text-sm">Free trip planning for India — honeymoons, offsites, school trips and solo adventures. No login, no tracking.</p>
            <p className="muted text-xs">
              In an emergency dial <a href="tel:112" className="font-bold text-rose-700 dark:text-rose-300">112</a> · Tourist helpline{" "}
              <a href="tel:18001111363" className="font-bold text-rose-700 dark:text-rose-300">1800-11-1363</a>
            </p>
          </div>
          {FOOTER_COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider opacity-60">{c.title}</p>
              <ul className="space-y-2 text-sm">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-rose-600 dark:hover:text-rose-300">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="muted mt-10 flex flex-col gap-3 border-t border-[var(--line)] pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName}
            {BUSINESS.address ? ` · ${BUSINESS.address}` : ""} · Made in India 🇮🇳
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Sample stays &amp; reviews are illustrative — verify before booking.</span>
            <button
              type="button"
              className="shrink-0 underline decoration-dotted underline-offset-2 hover:text-rose-500"
              onClick={() => {
                if (window.confirm("Clear all saved trips, stays and roulette wins from this device?")) resetEverything();
              }}
            >
              Clear my data
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
