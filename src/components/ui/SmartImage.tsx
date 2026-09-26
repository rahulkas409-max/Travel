"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { postcardDataUrl, type ResolvedImage } from "@/lib/images";
import { curatedFallback, keySource, openToResolved, peekOpen, resolveOpen, type ImageSource } from "@/lib/imageSources";

interface Props {
  /** Preferred: an open-image source (Wikipedia / Commons → curated → postcard). */
  source?: ImageSource;
  /** Legacy/curated-only shorthand. */
  imageKey?: string;
  label?: string;
  seed?: string | number;
  width?: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  children?: ReactNode;
  /** Small "© author" chip for open images (hero/gallery use). */
  showCredit?: boolean | "top";
}

type Stage = "resolving" | "open" | "curated" | "art";

/**
 * Image with a shimmer placeholder that resolves lazily (only when near the
 * viewport) to a live, open-licensed photo, falling back to a curated photo and
 * finally to generated postcard art — never a broken image.
 */
export function SmartImage({ source, imageKey, label, seed = 0, width = 900, className, imgClassName, priority, children, showCredit }: Props) {
  const src: ImageSource = useMemo(
    () => source ?? keySource(imageKey ?? "travel", label ?? "", seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source?.wiki, source?.fallbackKey, source?.label, source?.seed, JSON.stringify(source?.queries), imageKey, label, seed],
  );
  const wantsOpen = !!(src.wiki || src.queries?.length);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [img, setImg] = useState<ResolvedImage | null>(null);
  const [stage, setStage] = useState<Stage>("resolving");
  const [loaded, setLoaded] = useState(false);

  // Resolve (instantly from cache when possible; otherwise once near the viewport).
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    if (!wantsOpen) {
      setImg(curatedFallback(src, width));
      setStage("curated");
      return;
    }
    const known = peekOpen(src);
    if (known) {
      setImg(openToResolved(known, src));
      setStage("open");
      return;
    }
    if (known === null) {
      setImg(curatedFallback(src, width));
      setStage("curated");
      return;
    }
    setImg(null);
    setStage("resolving");
    const go = () => {
      const deadline = setTimeout(() => {
        if (!cancelled) {
          setImg((cur) => cur ?? curatedFallback(src, width));
          setStage((st) => (st === "resolving" ? "curated" : st));
        }
      }, 7000);
      resolveOpen(src).then((open) => {
        clearTimeout(deadline);
        if (cancelled) return;
        if (open) {
          setImg(openToResolved(open, src));
          setStage("open");
          setLoaded(false);
        } else {
          setImg((cur) => cur ?? curatedFallback(src, width));
          setStage((st) => (st === "resolving" ? "curated" : st));
        }
      });
    };
    if (priority || typeof IntersectionObserver === "undefined") {
      go();
      return () => {
        cancelled = true;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          go();
        }
      },
      { rootMargin: "400px" },
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [src, width, wantsOpen, priority]);

  const fail = () => {
    if (stage === "open") {
      setImg(curatedFallback(src, width));
      setStage("curated");
      setLoaded(false);
    } else if (stage === "curated") {
      const art = postcardDataUrl(img?.family ?? "city", src.label, 900, 600, false);
      if (art && img) {
        setImg({ ...img, src: art });
        setStage("art");
      } else setLoaded(true);
    } else setLoaded(true);
  };

  // Images that finished (or failed) before hydration never fire onLoad/onError.
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !img || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(true);
    else fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img?.src]);

  return (
    <div ref={wrapRef} className={cn(/(^|\s)(absolute|fixed)(\s|$)/.test(className ?? "") ? "" : "relative", "overflow-hidden bg-sand-200 dark:bg-slate-800", className)}>
      {!loaded && <div className="shimmer absolute inset-0" aria-hidden />}
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          key={img.src}
          src={img.src}
          alt={src.label}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={fail}
          className={cn("h-full w-full object-cover transition duration-700", loaded ? "scale-100 opacity-100" : "scale-105 opacity-0", imgClassName)}
        />
      )}
      {children}
      {showCredit && stage === "open" && img?.provider && (
        <a
          href={img.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute z-10 max-w-[70%] truncate rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur hover:bg-black/65",
            showCredit === "top" ? "right-3 top-3" : "bottom-1.5 left-1.5",
          )}
          title={img.credit}
        >
          📷 {img.author ? img.author : img.provider}
        </a>
      )}
    </div>
  );
}
