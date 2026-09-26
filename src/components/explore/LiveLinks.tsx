import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { OutLink } from "@/lib/links";
import { cn } from "@/lib/format";

/** Row of outbound "live availability" tiles (opens the provider's own search). */
export function LiveLinks({ links, title, note, className, children }: { links: OutLink[]; title: string; note?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("glass p-4", className)}>
      <p className="text-sm font-bold">{title}</p>
      {note && <p className="muted mt-0.5 text-xs">{note}</p>}
      {children && <div className="mt-3">{children}</div>}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn("group relative min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg", l.tone)}
          >
            <ArrowUpRight className="absolute right-2 top-2 h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <p className="truncate pr-4 text-sm font-bold">{l.label}</p>
            <p className="truncate text-[11px] text-white/80">{l.sub}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
