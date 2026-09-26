import { cn } from "@/lib/format";

/** RoamIndia mark: a sun rising over Himalayan peaks and the sea, in the marigold → rose palette. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ri-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="0.55" stopColor="#e06d53" />
          <stop offset="1" stopColor="#b8432f" />
        </linearGradient>
        <clipPath id="ri-clip">
          <rect width="40" height="40" rx="11" />
        </clipPath>
      </defs>
      <g clipPath="url(#ri-clip)">
        <rect width="40" height="40" fill="url(#ri-bg)" />
        <circle cx="27" cy="14" r="5.5" fill="#fde68a" />
        <path d="M-1 31 L11 16 L17 23 L22 17.5 L41 31 Z" fill="#faf7f2" />
        <path d="M11 16 L13.6 19.2 L11.6 20.4 L10 19.3 L8.4 20.2 Z" fill="#fde68a" opacity="0.9" />
        <path d="M-1 31 L41 31 L41 41 L-1 41 Z" fill="#588157" />
        <path d="M-1 33.5 Q4 31.8 9 33.5 T19 33.5 T29 33.5 T41 33.5" stroke="#faf7f2" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.85" />
      </g>
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={compact ? 32 : 38} className="shrink-0 drop-shadow-[0_6px_14px_rgba(224,109,83,0.35)]" />
      <span className="leading-none">
        <span className="font-display text-[1.35rem] font-bold tracking-tight">
          Roam<span className="bg-gradient-to-r from-marigold-500 to-rose-500 bg-clip-text text-transparent">India</span>
        </span>
        {!compact && <span className="mt-0.5 block text-[9.5px] font-semibold uppercase tracking-[0.22em] opacity-55">Plan · Stay · Explore</span>}
      </span>
    </span>
  );
}
