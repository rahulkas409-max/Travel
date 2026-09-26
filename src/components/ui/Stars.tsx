import { Star } from "lucide-react";
import { cn } from "@/lib/format";

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-stone-300 dark:text-stone-600" style={{ width: size, height: size }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="fill-marigold-500 text-marigold-500" style={{ width: size, height: size }} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function ScoreBar({ label, value, max = 5, suffix }: { label: string; value: number; max?: number; suffix?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = pct >= 90 ? "bg-sage-500" : pct >= 75 ? "bg-marigold-500" : "bg-rose-500";
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="muted font-medium">{label}</span>
        <span className="font-semibold tabular-nums">
          {suffix ? `${value} ${suffix}` : value.toFixed(1)}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-white/10">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
