"use client";

import { Download, Image as ImageIcon, Loader2, Share2, Smartphone } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { SmartImage } from "@/components/ui/SmartImage";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { canShareFiles, getImage, isIOS, saveImage, type SaveMode } from "@/lib/images";

export interface PhotoRequest {
  imageKey: string;
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

/** Full-screen photo viewer with 1-tap high-res photo / wallpaper downloads. */
export function ImageDownloadModal({ request, onClose }: { request: PhotoRequest | null; onClose: () => void }) {
  const { toast } = useTrip();
  const [busy, setBusy] = useState<SaveMode | "share" | null>(null);
  const [shareable, setShareable] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setShareable(canShareFiles());
    setIos(isIOS());
  }, []);

  const image = request ? getImage(request.imageKey, request.label, request.seed ?? 0, 1600) : null;

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
      {image && request && (
        <div className="space-y-4">
          <SmartImage
            imageKey={request.imageKey}
            label={request.label}
            seed={request.seed}
            width={1600}
            priority
            className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/10]"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" className="btn-primary" onClick={() => run("photo")} disabled={!!busy}>
              {busy === "photo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download High-Res Photo
            </button>
            <button type="button" className="btn-ghost" onClick={() => run("wallpaper")} disabled={!!busy}>
              {busy === "wallpaper" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              Phone Wallpaper
            </button>
            {shareable ? (
              <button type="button" className="btn-ghost" onClick={() => run("photo", true)} disabled={!!busy}>
                {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                {ios ? "Save to Photos" : "Share"}
              </button>
            ) : (
              <a href={image.hiRes} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <ImageIcon className="h-4 w-4" /> Open original
              </a>
            )}
          </div>
          <p className="muted text-xs">
            {image.credit} · 2400px JPEG · free to use under the Unsplash License.
            {ios && " On iPhone/iPad, “Save to Photos” opens the share sheet — tap “Save Image”."}
          </p>
        </div>
      )}
    </Sheet>
  );
}
