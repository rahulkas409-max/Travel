"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getWikiSummary, type WikiSummary } from "@/lib/openData";

/** Live "About" text from Wikipedia (CC BY-SA), with a fallback to our own blurb. */
export function WikiAbout({ title, fallback }: { title: string; fallback: string }) {
  const [sum, setSum] = useState<WikiSummary | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    setSum(undefined);
    getWikiSummary(title).then((s) => live && setSum(s));
    return () => {
      live = false;
    };
  }, [title]);

  if (sum === undefined)
    return (
      <div className="space-y-2" aria-label="Loading">
        {[100, 96, 88, 60].map((w) => (
          <div key={w} className="shimmer h-3.5 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    );

  return (
    <div>
      {sum?.description && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-rose-500">{sum.description}</p>}
      <p className="leading-relaxed">{sum?.extract ?? fallback}</p>
      {sum && (
        <p className="muted mt-2 text-xs">
          From{" "}
          <a href={sum.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-rose-600 hover:underline dark:text-rose-300">
            Wikipedia <ExternalLink className="h-3 w-3" />
          </a>{" "}
          · CC BY-SA 4.0 · refreshed every few days
        </p>
      )}
    </div>
  );
}
