"use client";

import { FileDown, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { cn, slug } from "@/lib/format";
import { isIOS } from "@/lib/images";
import { generatePdf, printDossier } from "@/lib/pdfGenerator";
import { DOSSIER_ID } from "./PrintDossier";

/** One-click A4 PDF (html2canvas + jsPDF) with a print-stylesheet fallback. */
export function PdfExportButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { destination, config, toast, hydrated } = useTrip();
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);

  const run = async () => {
    const el = document.getElementById(DOSSIER_ID);
    if (!el) {
      toast("Dossier is still loading — try again in a second", "warn");
      return;
    }
    sound.unlock();
    sound.play("whoosh");
    setProgress({ page: 0, total: el.querySelectorAll("[data-a4-page]").length });
    try {
      const filename = `roamindia-${slug(destination.name)}-${config.days}d-${config.occasion}.pdf`;
      const result = await generatePdf(el, {
        filename,
        title: `RoamIndia · ${destination.name} · ${config.days} days`,
        onProgress: setProgress,
        preferShare: isIOS(),
      });
      sound.play("chime");
      void celebrate("export");
      toast(result === "shared" ? "📄 PDF ready — save it to Files for offline use" : "📄 A4 dossier downloaded", "success");
    } catch (err) {
      console.error(err);
      sound.play("error");
      toast("PDF engine hiccup — opening the print dialog instead", "warn");
      printDossier();
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button type="button" onClick={run} disabled={!!progress || !hydrated} className={cn("btn-primary", compact ? "" : "flex-1 text-base")}>
        {progress ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
        {progress ? `Rendering page ${Math.max(1, progress.page)}/${progress.total}…` : "Export A4 PDF"}
      </button>
      <button
        type="button"
        onClick={() => {
          sound.play("pop");
          printDossier();
        }}
        className="btn-ghost"
        disabled={!hydrated}
      >
        <Printer className="h-4 w-4" /> Print
      </button>
    </div>
  );
}
