"use client";

import { VOYAGE } from "@data/geo";
import { Compass, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getVoyageBanner, getVoyageSummary, type OpenImage, type VoyageSummary } from "@/lib/openData";

/**
 * "Traveller's guide" from Wikivoyage: the community's curated panoramic banner
 * (shown at its native ~7:1 ratio so it stays sharp) plus the practical intro.
 */
export function VoyageGuide({ destinationId, name }: { destinationId: string; name: string }) {
  const title = VOYAGE[destinationId] ?? name;
  const [banner, setBanner] = useState<OpenImage | null>(null);
  const [sum, setSum] = useState<VoyageSummary | null | undefined>(undefined);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    let live = true;
    setBanner(null);
    setSum(undefined);
    setImgOk(true);
    getVoyageBanner(title).then((b) => live && setBanner(b));
    getVoyageSummary(title).then((s) => live && setSum(s));
    return () => {
      live = false;
    };
  }, [title]);

  if (sum === null && !banner) return null;

  return (
    <div className="glass overflow-hidden">
      {banner && imgOk && (
        <a href={banner.sourceUrl} target="_blank" rel="noopener noreferrer" className="relative block aspect-[7/1] w-full bg-sand-200 dark:bg-slate-800" title={banner.author ? `${banner.author} · ${banner.license ?? ""}` : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.thumb} alt={`${name} panorama`} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" onError={() => setImgOk(false)} />
          {banner.author && <span className="absolute bottom-1 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/90">📷 {banner.author}</span>}
        </a>
      )}
      <div className="p-5">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Compass className="h-5 w-5 text-rose-500" /> Traveller&apos;s guide
        </h2>
        {sum === undefined ? (
          <div className="space-y-2">
            {[100, 94, 70].map((w) => (
              <div key={w} className="shimmer h-3.5 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : sum ? (
          <>
            <p className="leading-relaxed">{sum.extract}</p>
            <p className="muted mt-2 text-xs">
              From{" "}
              <a href={sum.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-rose-600 hover:underline dark:text-rose-300">
                Wikivoyage — full guide: get in, get around, see, eat, sleep <ExternalLink className="h-3 w-3" />
              </a>{" "}
              · CC BY-SA 4.0
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
