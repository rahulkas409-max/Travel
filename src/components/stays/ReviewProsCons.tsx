import { ThumbsDown, ThumbsUp } from "lucide-react";

export function ReviewProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-sage-300/60 bg-sage-50/80 p-3 dark:border-sage-500/30 dark:bg-sage-500/10">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-700 dark:text-sage-300">
          <ThumbsUp className="h-3.5 w-3.5" /> Loved
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {pros.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="text-sage-500">＋</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-rose-300/60 bg-rose-50/80 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <ThumbsDown className="h-3.5 w-3.5" /> Heads-up
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {cons.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-rose-500">－</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
