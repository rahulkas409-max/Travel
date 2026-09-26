"use client";

import { Download, ExternalLink, Image as ImageIcon, Loader2, Share2, Smartphone } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { curatedFallback, keySource, openToResolved, peekOpen, resolveOpen, type ImageSource } from "@/lib/imageSources";
import { canShareFiles, isIOS, saveImage, type ResolvedImage, type SaveMode } from "@/lib/images";
import { getFileCredit } from "@/lib/openData";

export interface PhotoRequest {
  source?: ImageSource;
  imageKey?: string;
  label: string;
  seed?: string | number;
  caption?: string;
}

interface PhotoViewerValue {
  openPhoto: (req: PhotoRequest) => void;
}

const PhotoViewerContext = createContext<PhotoViewerValue | null>(null);

export function usePhotoViewer(): PhotoViewerValue {
  const ctx = useContext(PhotoViewerContext);
  if (!ctx) throw new Error("usePhotoViewer must be used within <PhotoViewerProvider>");
  return ctx;
}

export function PhotoViewerProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<PhotoRequest | null>(null);
  const openPhoto = useCallback((r: PhotoRequest) => {
    sound.play("flip");
    setReq(r);
  }, []);
  const value = useMemo(() => ({ openPhoto }), [openPhoto]);
  return (
    <PhotoViewerContext.Provider value={value}>
      {children}
      <ImageDownloadModal request={req} onClose={() => setReq(null)} />
    </PhotoViewerContext.Provider>
  );
}

function toSource(r: PhotoRequest): ImageSource {
  return r.source ?? keySource(r.imageKey ?? "travel", r.label, r.seed ?? 0);
}

/** Full-screen viewer with 1-tap high-res photo / wallpaper downloads and proper attribution. */
export function ImageDownloadModal({ request, onClose }: { request: PhotoRequest | null; onClose: () => void }) {
  const { toast } = useTrip();
  const [busy, setBusy] = useState<SaveMode | "share" | null>(null);
  const [shareable, setShareable] = useState(false);
  const [ios, setIos] = useState(false);
  const [image, setImage] = useState<ResolvedImage | null>(null);

  useEffect(() => {
    setShareable(canShareFiles());
    setIos(isIOS());
  }, []);

  const source = useMemo(() => (request ? toSource(request) : null), [request]);

  useEffect(() => {
    if (!source) {
      setImage(null);
      return;
    }
    let cancelled = false;
    const known = peekOpen(source);
    const initial = known ? openToResolved(known, source) : curatedFallback(source, 1600);
    setImage(initial);
    const enrich = async (img: ResolvedImage) => {
      if (img.open && img.file && !img.author) {
        const credit = await getFileCredit(img.file);
        if (!cancelled && credit) setImage({ ...img, author: credit.author, license: credit.license, sourceUrl: credit.sourceUrl, credit: `${credit.author ?? "Unknown author"} · ${credit.license ?? "see source"} via ${img.provider}` });
      }
    };
    if (known) void enrich(initial);
    else if (known === undefined)
      void resolveOpen(source).then((open) => {
        if (cancelled || !open) return;
        const r = openToResolved(open, source);
        setImage(r);
        void enrich(r);
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  const run = async (mode: SaveMode, share = false) => {
    if (!image) return;
    setBusy(share ? "share" : mode);
    try {
      const result = await saveImage(image, { mode, share });
      sound.play("success");
      toast(
        result === "shared"
          ? "Shared — choose “Save Image” to keep it in Photos"
          : result === "generated"
            ? "Offline — saved a RoamIndia postcard instead"
            : mode === "wallpaper"
              ? "📱 Wallpaper downloaded"
              : "📸 High-res photo downloaded",
        "success",
      );
    } catch {
      sound.play("error");
      toast("Couldn't save that image — try again", "warn");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet open={!!request} onClose={onClose} title={request?.label} subtitle={request?.caption} size="xl">
      {source && request && (
        <div className="space-y-4">
          <SmartImage source={source} width={1600} priority className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/10]" />
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" className="btn-primary" onClick={() => run("photo")} disabled={!!busy || !image}>
              {busy === "photo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download High-Res Photo
            </button>
            <button type="button" className="btn-ghost" onClick={() => run("wallpaper")} disabled={!!busy || !image}>
              {busy === "wallpaper" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              Phone Wallpaper
            </button>
            {shareable ? (
              <button type="button" className="btn-ghost" onClick={() => run("photo", true)} disabled={!!busy || !image}>
                {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                {ios ? "Save to Photos" : "Share"}
              </button>
            ) : (
              image && (
                <a href={image.hiRes} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <ImageIcon className="h-4 w-4" /> Open original
                </a>
              )
            )}
          </div>
          {image && (
            <div className="muted flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span>📷 {image.open ? image.credit : `${image.credit} · Unsplash License`}</span>
              {image.sourceUrl && (
                <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-rose-600 hover:underline dark:text-rose-300">
                  Source & license <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {ios && <span className="basis-full">On iPhone/iPad, “Save to Photos” opens the share sheet — tap “Save Image”.</span>}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
