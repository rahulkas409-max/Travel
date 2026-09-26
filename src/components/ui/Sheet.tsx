"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/format";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
  /** Right-side drawer on tablet/desktop instead of a centred modal. */
  side?: boolean;
}

/**
 * Bottom sheet on phones (drag down to dismiss), centred modal or right
 * drawer on tablets & desktop. Locks scroll, closes on Esc / backdrop.
 */
export function Sheet({ open, onClose, title, subtitle, children, footer, size = "md", side = false }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useDragControls();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const width = size === "xl" ? "md:max-w-4xl" : size === "lg" ? "md:max-w-2xl" : "md:max-w-lg";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center" role="presentation">
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn(
              "glass-strong relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-b-none outline-none md:rounded-3xl",
              width,
              side && "md:absolute md:right-0 md:top-0 md:h-full md:max-h-none md:rounded-none md:rounded-l-3xl",
            )}
            initial={side ? { x: 0, y: "100%" } : { y: "100%", opacity: 0.6 }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info: PanInfo) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="flex cursor-grab touch-none justify-center pb-1 pt-2.5 active:cursor-grabbing md:hidden"
              onPointerDown={(e) => drag.start(e)}
            >
              <span className="h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-600" />
            </div>
            {(title || subtitle) && (
              <div className="flex items-start gap-3 border-b border-[var(--line)] px-5 pb-3 pt-2 md:pt-5">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 id={titleId} className="font-display text-xl font-semibold leading-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && <div className="muted mt-0.5 text-sm">{subtitle}</div>}
                </div>
                <button type="button" onClick={onClose} className="icon-btn h-9 w-9 shrink-0" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
            {footer && (
              <div className="border-t border-[var(--line)] px-5 py-3" style={{ paddingBottom: "calc(0.75rem + var(--safe-bottom))" }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
