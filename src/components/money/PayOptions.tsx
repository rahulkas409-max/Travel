"use client";

import { Check, Copy, CreditCard, MessageCircle, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { BUSINESS, PLANS, type PlanId } from "@/config/business";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";
import { payMethods, upiLink } from "@/lib/payments";
import { copyText } from "@/lib/share";

/** Price + every available way to pay (Razorpay link → UPI deep link/QR → WhatsApp). */
export function PayOptions({ plan, reference, className }: { plan: PlanId; reference?: string; className?: string }) {
  const p = PLANS[plan];
  const methods = payMethods(plan, reference);
  const upi = upiLink(p.price, `${BUSINESS.name} ${p.name}${reference ? ` ${reference}` : ""}`);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!upi) return;
    let live = true;
    import("qrcode").then((QR) => QR.toDataURL(upi, { margin: 1, width: 360, color: { dark: "#1c1917", light: "#ffffff" } })).then((d) => live && setQr(d)).catch(() => undefined);
    return () => {
      live = false;
    };
  }, [upi]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white dark:bg-white/10">
        <span className="text-sm font-semibold">{p.name}</span>
        <span className="text-2xl font-extrabold tabular-nums">
          {inr(p.price)} <span className="text-xs font-medium text-white/70">{p.unit}</span>
        </span>
      </div>
      <p className="muted -mt-1 text-center text-[11px]">Final price · all taxes included · no hidden charges</p>

      {methods.map((m) => (
        <a
          key={m.kind}
          href={m.href}
          target={m.kind === "upi" ? undefined : "_blank"}
          rel="noopener noreferrer"
          onClick={() => sound.play("pop")}
          className={cn("flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition hover:brightness-105", m.kind === "whatsapp" ? "border border-[var(--line)] bg-white/70 dark:bg-white/5" : "bg-gradient-to-r from-marigold-500 to-rose-500 text-white shadow-lift", m.kind === "upi" && "sm:hidden")}
        >
          {m.kind === "razorpay" ? <CreditCard className="h-4 w-4" /> : m.kind === "upi" ? <Smartphone className="h-4 w-4" /> : <MessageCircle className="h-4 w-4 text-[#25D366]" />}
          {m.label}
        </a>
      ))}

      {upi && qr && (
        <div className="hidden items-center gap-4 rounded-2xl border border-[var(--line)] p-3 sm:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="UPI QR code" className="h-32 w-32 rounded-lg" />
          <div className="min-w-0 text-sm">
            <p className="font-bold">Scan with any UPI app</p>
            <p className="muted text-xs">GPay · PhonePe · Paytm · BHIM — ₹{p.price} prefilled, 0% fees.</p>
            {BUSINESS.upiId && (
              <button
                type="button"
                onClick={async () => {
                  if (await copyText(BUSINESS.upiId!)) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }
                }}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-black/5 px-2 py-1 font-mono text-xs dark:bg-white/10"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {BUSINESS.upiId}
              </button>
            )}
          </div>
        </div>
      )}
      <p className="muted text-center text-[11px]">After paying, send the UPI reference on WhatsApp — you&apos;ll receive your access code or activation within a few hours.</p>
    </div>
  );
}
