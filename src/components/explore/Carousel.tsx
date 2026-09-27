"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

/** MMT-style horizontal rail: snap scrolling, arrow buttons on desktop, "View all" link. */
export function Carousel({ title, subtitle, href, children, className }: { title?: ReactNode; subtitle?: ReactNode; href?: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    sync();
    const el = ref.current;
    el?.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const by = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <section className={cn("relative", className)}>
      <div className={cn("mb-3 flex items-end justify-between gap-3", !title && "justify-end")}>
        <div className={cn("min-w-0", !title && "hidden")}>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="muted mt-0.5 text-sm">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {href && (
            <Link href={href} className="mr-1 text-sm font-bold text-rose-600 hover:underline dark:text-rose-300">
              View all →
            </Link>
          )}
          <button type="button" onClick={() => by(-1)} disabled={edge.start} className="icon-btn hidden !h-9 !w-9 disabled:opacity-30 md:inline-flex" aria-label="Scroll left">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => by(1)} disabled={edge.end} className="icon-btn hidden !h-9 !w-9 disabled:opacity-30 md:inline-flex" aria-label="Scroll right">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6">
        {children}
      </div>
    </section>
  );
}
