"use client";

import { getImage, postcardDataUrl, type ResolvedImage } from "@/lib/images";
import { cn } from "@/lib/format";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  imageKey: string;
  label: string;
  seed?: string | number;
  width?: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  onResolved?: (img: ResolvedImage) => void;
  children?: React.ReactNode;
}

/**
 * <img> with a shimmer placeholder and a generated-postcard fallback, so a
 * missing CDN photo never shows a broken icon.
 */
export function SmartImage({ imageKey, label, seed = 0, width = 900, className, imgClassName, priority, children }: Props) {
  const image = useMemo(() => getImage(imageKey, label, seed, width), [imageKey, label, seed, width]);
  const [src, setSrc] = useState(image.src);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const fallback = () => {
    const art = postcardDataUrl(image.family, label, 900, 600, false);
    if (art && imgRef.current?.src !== art) setSrc(art);
    else setLoaded(true);
  };

  useEffect(() => {
    setSrc(image.src);
    setLoaded(false);
  }, [image.src]);

  // Images that finished (or failed) before hydration never fire React's onLoad/onError.
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(true);
    else fallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-sand-200 dark:bg-slate-800", className)}>
      {!loaded && <div className="shimmer absolute inset-0" aria-hidden />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        ref={imgRef}
        onLoad={() => setLoaded(true)}
        onError={fallback}
        className={cn(
          "h-full w-full object-cover transition duration-700",
          loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
          imgClassName,
        )}
      />
      {children}
    </div>
  );
}
