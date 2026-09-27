"use client";

import { Check, Copy, MessageCircle, Share } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { cn } from "@/lib/format";
import { copyText, formatWhatsApp, whatsappUrl } from "@/lib/share";
import { pickDossierStays } from "./PrintDossier";

/** Formats the whole plan with emojis for WhatsApp; 1-tap copy, open WhatsApp or native share. */
export function WhatsAppExporter() {
  const { destination, plan, config, savedStays, toast } = useTrip();
  const [tips, setTips] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);

  const text = useMemo(
    () => formatWhatsApp(destination, plan, config, pickDossierStays(destination, config, savedStays), { includeTips: tips }),
    [destination, plan, config, savedStays, tips],
  );

  const copy = async () => {
    const ok = await copyText(text);
    if (ok) {
      sound.play("success");
      void celebrate("small");
      setCopied(true);
      toast("✅ Copied — paste it into any WhatsApp chat", "success");
      setTimeout(() => setCopied(false), 2200);
    } else {
      sound.play("error");
      toast("Clipboard blocked — long-press the text to copy", "warn");
    }
  };

  return (
    <div className="glass flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <MessageCircle className="h-5 w-5 text-[#25D366]" /> WhatsApp format
          </h3>
          <p className="muted mt-1 text-sm">Bold headings, emojis and times — ready for your group chat.</p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={tips} onChange={(e) => setTips(e.target.checked)} className="h-4 w-4 accent-rose-500" />
          Include tips
        </label>
      </div>
      <pre className="no-scrollbar mt-4 max-h-80 flex-1 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#e7ffdb] p-4 font-sans text-[13px] leading-relaxed text-slate-900 shadow-inner dark:bg-[#005c4b] dark:text-white">
        {text}
      </pre>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={copy} className={cn("btn", copied ? "bg-sage-500 text-white" : "bg-[#25D366] text-white hover:brightness-105")}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "1-tap copy"}
        </button>
        <a href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer" className="btn-ghost" onClick={() => sound.play("pop")}>
          <MessageCircle className="h-4 w-4" /> Open WhatsApp
        </a>
        {canShare && (
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => {
              try {
                await navigator.share({ title: `RoamIndia · ${destination.name}`, text });
              } catch {
                /* cancelled */
              }
            }}
          >
            <Share className="h-4 w-4" /> Share…
          </button>
        )}
      </div>
    </div>
  );
}
