/**
 * Client-side A4 PDF generator.
 *
 * The <PrintDossier/> component renders fixed-size 794×1123 CSS-pixel pages
 * (A4 at 96 dpi) marked with `data-a4-page`. Each page is rasterised with
 * html2canvas at 2–2.5× (≈190–240 dpi — crisp on paper) and placed full-bleed
 * on a jsPDF A4 page. Both libraries are lazy-loaded so they never touch the
 * initial bundle.
 *
 * If anything fails (very old browser, memory pressure), callers fall back to
 * window.print(), which uses the dedicated @media print stylesheet.
 */

import { canShareFiles, downloadBlob, isIOS } from "./images";

export interface PdfProgress {
  page: number;
  total: number;
}

export interface PdfOptions {
  filename: string;
  title: string;
  onProgress?: (p: PdfProgress) => void;
  /** Offer the native share sheet on iOS/iPadOS (Save to Files / AirDrop / WhatsApp). */
  preferShare?: boolean;
}

export async function generatePdf(container: HTMLElement, opts: PdfOptions): Promise<"downloaded" | "shared"> {
  const pages = Array.from(container.querySelectorAll<HTMLElement>("[data-a4-page]"));
  if (pages.length === 0) throw new Error("Nothing to export yet");

  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);

  // iOS Safari caps canvas memory (~16.7 MP); 2× keeps each page well under it.
  const scale = isIOS() ? 2 : 2.5;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  pdf.setProperties({ title: opts.title, creator: "RoamIndia", subject: "Travel itinerary dossier" });

  // Wait for web fonts so glyph metrics match the preview.
  if (document.fonts?.ready) await document.fonts.ready;

  for (let i = 0; i < pages.length; i++) {
    opts.onProgress?.({ page: i + 1, total: pages.length });
    const canvas = await html2canvas(pages[i], {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 1024,
    });
    const img = canvas.toDataURL("image/jpeg", 0.93);
    if (i > 0) pdf.addPage("a4", "portrait");
    pdf.addImage(img, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    // Free the canvas memory promptly on mobile.
    canvas.width = 0;
    canvas.height = 0;
    // Yield to keep the progress UI responsive.
    await new Promise((r) => setTimeout(r, 0));
  }

  const blob = pdf.output("blob");

  if (opts.preferShare && canShareFiles()) {
    const file = new File([blob], opts.filename, { type: "application/pdf" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: opts.title });
        return "shared";
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return "shared";
      }
    }
  }
  downloadBlob(blob, opts.filename);
  return "downloaded";
}

/** Fallback: native print dialog using the @media print stylesheet. */
export function printDossier() {
  document.documentElement.classList.add("printing-dossier");
  const cleanup = () => {
    document.documentElement.classList.remove("printing-dossier");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  // Safari sometimes skips afterprint.
  setTimeout(cleanup, 60_000);
}
