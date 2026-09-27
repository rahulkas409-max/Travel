"use client";

import { OCCASION_BY_ID } from "@data/occasions";
import { Camera, FileText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { farmsFor, staysFor } from "@/lib/destinations";
import { duration, inr } from "@/lib/format";
import { activitySource, destinationSource, propertySource, type ImageSource } from "@/lib/imageSources";
import { PACE_META, tripTotals } from "@/lib/itinerary";
import { usePhotoViewer } from "./ImageDownloadModal";
import { PdfExportButton } from "./PdfExportButton";
import { PrintDossier } from "./PrintDossier";
import { WhatsAppExporter } from "./WhatsAppExporter";
import { ProPanel } from "@/components/money/ProPanel";
import { SupportCard } from "@/components/money/SupportCard";

export function ExportHub() {
  const { destination: dest, plan, config, hydrated } = useTrip();
  const totals = useMemo(() => tripTotals(dest, plan, config), [dest, plan, config]);
  const occ = OCCASION_BY_ID[config.occasion];

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Export & Share" title="Take your trip offline" destination>
        A print-ready A4 dossier (schedule, stay contacts, transit cheat sheet, emergency numbers), a WhatsApp-formatted plan, and high-res photos for your
        phone wallpaper.
      </PageHeader>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="glass flex flex-col p-5">
          <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <FileText className="h-5 w-5 text-rose-500" /> A4 PDF dossier
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Stat label="Destination" value={dest.name} />
            <Stat label="Occasion" value={`${occ.emoji} ${occ.short}`} />
            <Stat label="Days · pace" value={`${config.days} · ${PACE_META[config.pace].label}`} />
            <Stat label="Est. budget" value={inr(totals.estimatedTotal)} />
            <Stat label="Transit time" value={duration(totals.transitMins)} />
            <Stat label="Avg day load" value={`${totals.avgLoad}%`} />
            <Stat label="Tickets pp" value={inr(totals.activityCost)} />
            <Stat label="Pacing flags" value={String(totals.warnings)} />
          </div>
          <DossierPreview ready={hydrated} />
          <PdfExportButton className="mt-4" />
          <p className="muted mt-2 text-xs">
            Rendered on your device — nothing is uploaded. On iPhone/iPad the share sheet opens so you can “Save to Files”. “Print” uses the A4 print stylesheet
            (choose “Save as PDF”).
          </p>
        </div>
        <WhatsAppExporter />
      </section>

      <ProPanel />
      <SupportCard />

      <PhotoGallery />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-2.5 dark:bg-white/5">
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
      <p className="truncate font-semibold">{value}</p>
    </div>
  );
}

/** Scaled live preview of the actual A4 pages. */
function DossierPreview({ ready }: { ready: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(0.6, (el.clientWidth - 24) / 794)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="no-scrollbar mt-4 h-[420px] overflow-y-auto rounded-2xl border border-[var(--line)] bg-stone-200/70 p-3 dark:bg-slate-800/70">
      {ready ? (
        <div style={{ width: 794 * scale, margin: "0 auto" }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }} className="[&_[data-a4-page]]:shadow-xl">
            <PrintDossier preview />
          </div>
        </div>
      ) : (
        <div className="shimmer h-full rounded-xl" />
      )}
    </div>
  );
}

function PhotoGallery() {
  const { destination: dest } = useTrip();
  const { openPhoto } = usePhotoViewer();

  const photos = useMemo(() => {
    const list: { source: ImageSource; label: string; caption: string }[] = [0, 1, 2].map((i) => ({ source: destinationSource(dest, i), label: dest.name, caption: dest.tagline }));
    dest.highlights.slice(0, 7).forEach((h) => list.push({ source: activitySource(h, dest), label: h.name, caption: dest.name }));
    [...staysFor(dest.id), ...farmsFor(dest.id)].forEach((p) => list.push({ source: propertySource(p, 0, dest), label: p.name, caption: `${p.kind} · ${p.neighbourhood}` }));
    return list.slice(0, 16);
  }, [dest]);

  return (
    <section>
      <h2 className="section-title mb-1 flex items-center gap-2">
        <Camera className="h-5 w-5 text-marigold-500" /> High-res photos & wallpapers
      </h2>
      <p className="muted mb-4 text-sm">Tap any photo to download the 2400px original or a phone-sized wallpaper.</p>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <button
            key={`${p.label}-${i}`}
            type="button"
            onClick={() => openPhoto(p)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl shadow-card"
          >
            <SmartImage source={p.source} width={600} className={i % 3 === 0 ? "aspect-[3/4] w-full" : "aspect-[4/3] w-full"} imgClassName="transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 text-left text-xs font-semibold text-white">{p.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
