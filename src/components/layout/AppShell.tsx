"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DossierHost } from "@/components/export/PrintDossier";
import { PhotoViewerProvider } from "@/components/export/ImageDownloadModal";
import { EnquiryProvider } from "@/components/money/EnquiryModal";
import Link from "next/link";
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
          <Navbar />
          <VibeBarSlot />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-6 sm:px-6 xl:pb-16">{children}</main>
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

function Footer() {
  const { resetEverything } = useTrip();
  return (
    <footer className="no-print mx-auto w-full max-w-6xl px-4 pb-28 text-xs sm:px-6 xl:pb-10">
      <nav className="mb-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] pt-5 text-sm font-semibold" aria-label="Footer">
        <Link href="/pricing" className="hover:text-rose-500">Pricing</Link>
        <Link href="/partner" className="hover:text-rose-500">List your property</Link>
        <Link href="/pro" className="hover:text-rose-500">Organiser Pro</Link>
        <Link href="/destinations" className="hover:text-rose-500">Destinations</Link>
        <Link href="/disclosure" className="hover:text-rose-500">How we make money</Link>
        <Link href="/privacy" className="hover:text-rose-500">Privacy</Link>
        <Link href="/terms" className="hover:text-rose-500">Terms</Link>
      </nav>
      <div className="muted flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-[var(--ink)]">RoamIndia</span> is 100% free — no login, no tracking. Your trips live only in this
          browser&apos;s storage.
        </p>
        <div className="flex items-center gap-3">
          <span>Stay listings &amp; reviews are illustrative seed data — verify before booking.</span>
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
    </footer>
  );
}
