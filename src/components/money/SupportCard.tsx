"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { sound } from "@/lib/audio";
import { PayOptions } from "./PayOptions";

/** Optional ₹49 "buy us a chai" — shown after exports, never blocks anything. */
export function SupportCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="glass flex items-center gap-3 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
          <Heart className="h-5 w-5 fill-current" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Enjoying RoamIndia? Keep it free for everyone.</p>
          <p className="muted text-xs">A one-time ₹49 chai via UPI helps pay for hosting. Totally optional.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.play("pop");
            setOpen(true);
          }}
          className="btn-ghost shrink-0 !min-h-[40px] !text-xs"
        >
          ☕ ₹49
        </button>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="Support RoamIndia" subtitle="Thank you — every chai keeps the planner free.">
        <PayOptions plan="support" />
      </Sheet>
    </>
  );
}
