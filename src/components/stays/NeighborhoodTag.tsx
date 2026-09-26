import type { SuitabilityBadge } from "@data/types";
import { Briefcase, GraduationCap, Heart, Laptop, Users } from "lucide-react";
import { cn } from "@/lib/format";

export function NeighborhoodTag({ label }: { label: string }) {
  return <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-white/60 px-2.5 py-1 text-xs dark:bg-white/5">📍 {label}</span>;
}

const BADGE_STYLE: Record<SuitabilityBadge, { icon: typeof Heart; cls: string }> = {
  "Ideal for Corporate Offsites": { icon: Briefcase, cls: "bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300" },
  "Couples' Private Sanctuary": { icon: Heart, cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  "School-Safe Approved": { icon: GraduationCap, cls: "bg-marigold-100 text-marigold-700 dark:bg-marigold-500/15 dark:text-marigold-300" },
  "Workation Ready": { icon: Laptop, cls: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  "Solo & Social": { icon: Users, cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
};

export function SuitabilityPill({ badge, className }: { badge: SuitabilityBadge; className?: string }) {
  const { icon: Icon, cls } = BADGE_STYLE[badge];
  return (
    <span className={cn("pill !normal-case !tracking-normal", cls, className)}>
      <Icon className="h-3 w-3" /> {badge}
    </span>
  );
}
