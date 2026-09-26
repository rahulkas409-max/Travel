"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTrip } from "@/context/TripContext";
import { cn } from "@/lib/format";

export function Toaster() {
  const { toasts, dismissToast } = useTrip();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[90] flex flex-col items-center gap-2 px-4"
      style={{ bottom: "calc(6.5rem + var(--safe-bottom))" }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            onClick={() => dismissToast(t.id)}
            className={cn(
              "pointer-events-auto max-w-sm rounded-full px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md",
              t.tone === "success" && "bg-sage-600/95 text-white",
              t.tone === "warn" && "bg-rose-600/95 text-white",
              t.tone === "default" && "bg-slate-950/90 text-sand-100 dark:bg-sand-100/95 dark:text-slate-950",
            )}
          >
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
