"use client";

import { OCCASION_BY_ID, OCCASIONS } from "@data/occasions";
import type { Occasion } from "@data/types";
import { CheckCircle2, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DateRange } from "@/components/ui/DateRange";
import { Sheet } from "@/components/ui/Sheet";
import { BUSINESS } from "@/config/business";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { getDestination, getProperty } from "@/lib/destinations";
import { cn, inr } from "@/lib/format";
import { whatsappLink } from "@/lib/payments";

export interface EnquiryRequest {
  type: "group" | "property";
  propertyId?: string;
  destinationId?: string;
  source: string;
}

const EnquiryContext = createContext<{ openEnquiry: (r: EnquiryRequest) => void } | null>(null);

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used within <EnquiryProvider>");
  return ctx;
}

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<EnquiryRequest | null>(null);
  const openEnquiry = useCallback((r: EnquiryRequest) => {
    sound.play("flip");
    setReq(r);
  }, []);
  const value = useMemo(() => ({ openEnquiry }), [openEnquiry]);
  return (
    <EnquiryContext.Provider value={value}>
      {children}
      <EnquiryModal request={req} onClose={() => setReq(null)} />
    </EnquiryContext.Provider>
  );
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done"; id: string; stored: boolean } | { kind: "error"; message: string };

/** "Get free quotes" form: prefilled from the trip, delivered to the backend with a WhatsApp fallback. */
function EnquiryModal({ request, onClose }: { request: EnquiryRequest | null; onClose: () => void }) {
  const { config } = useTrip();
  const property = request?.propertyId ? getProperty(request.propertyId) : undefined;
  const dest = getDestination(property?.destinationId ?? request?.destinationId ?? config.destinationId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occasion, setOccasion] = useState<Occasion>(config.occasion);
  const [size, setSize] = useState(config.travellers);
  const [start, setStart] = useState(config.startDate);
  const [nights, setNights] = useState(Math.max(1, config.days - 1));
  const [budget, setBudget] = useState(config.budget);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(true);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    if (!request) return;
    setOccasion(config.occasion);
    setSize(Math.max(config.travellers, request.type === "group" && (config.occasion === "corporate" || config.occasion === "school") ? 10 : 1));
    setStart(config.startDate);
    setNights(Math.max(1, config.days - 1));
    setBudget(config.budget);
    setStatus({ kind: "idle" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const payload = {
    type: request?.type ?? "group",
    name,
    phone,
    email,
    destinationId: dest.id,
    destinationName: dest.name,
    propertyId: property?.id,
    propertyName: property?.name,
    occasion,
    groupSize: size,
    startDate: start,
    nights,
    budgetPerPerson: budget,
    message,
    consent,
    website,
    source: request?.source ?? "web",
  };

  const waText = `Hi ${BUSINESS.name}! Please send quotes:\n• ${property ? `${property.name}, ` : ""}${dest.name}\n• ${OCCASION_BY_ID[occasion].label}\n• ${size} people · ${nights} nights${start ? ` from ${start}` : ""}\n• Budget ~${inr(budget)}/person/day\n• ${name}, ${phone}${message ? `\n• ${message}` : ""}`;

  const submit = async () => {
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Couldn't send — please try WhatsApp below." });
        sound.play("error");
        return;
      }
      setStatus({ kind: "done", id: data.id, stored: !!data.stored });
      sound.play("chime");
      void celebrate("small");
    } catch {
      setStatus({ kind: "error", message: "You seem to be offline — send it on WhatsApp instead." });
    }
  };

  const title = property ? `Enquire about ${property.name}` : `Get free quotes for ${dest.name}`;

  return (
    <Sheet open={!!request} onClose={onClose} title={title} subtitle="Free for travellers · no login · reply within 24 hours" size="lg">
      {status.kind === "done" ? (
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-sage-500" />
          <p className="mt-3 font-display text-2xl font-bold">Request sent!</p>
          <p className="muted mt-1 text-sm">
            Reference <b className="font-mono text-[var(--ink)]">{status.id}</b>. We&apos;ll share up to 3 quotes on WhatsApp{email ? " and email" : ""}.
          </p>
          {!status.stored && (
            <a href={whatsappLink(`${waText}\nRef: ${status.id}`)} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-[#25D366] text-white">
              <MessageCircle className="h-4 w-4" /> Also send on WhatsApp (faster)
            </a>
          )}
          <button type="button" onClick={onClose} className="btn-ghost mx-auto mt-3 flex">
            Back to planning
          </button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="rounded-2xl bg-sage-50 p-3 text-xs text-sage-800 dark:bg-sage-500/10 dark:text-sage-200">
            <ShieldCheck className="mr-1 inline h-4 w-4" /> Free for you — we compare verified stays & operators and share the best 3 quotes. Properties pay a small fee, you never do.
          </div>

          {!property && (
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {OCCASIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOccasion(o.id)}
                  className={cn("shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold", occasion === o.id ? "bg-rose-500 text-white" : "bg-black/[0.05] dark:bg-white/10")}
                >
                  {o.emoji} {o.short}
                </button>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
            <DateRange unit="nights" labels={["Check-in", "Check-out"]} start={start} length={nights} onChange={(s, n) => { setStart(s); setNights(n); }} maxLength={30} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Group size">
              <input type="number" inputMode="numeric" min={1} max={2000} value={size} onChange={(e) => setSize(Number(e.target.value))} className="input" />
            </Field>
            <Field label="Budget / person / day (₹)">
              <input type="number" inputMode="numeric" min={500} step={500} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="input" />
            </Field>
            <Field label="Your name" className="col-span-2 sm:col-span-1">
              <input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Priya Sharma" />
            </Field>
            <Field label="Phone / WhatsApp" className="col-span-2 sm:col-span-1">
              <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 98xxx xxxxx" />
            </Field>
            <Field label="Email (optional)" className="col-span-2">
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
            </Field>
            <Field label="Anything else? (optional)" className="col-span-2">
              <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} className="input resize-none" placeholder="Conference hall for 40, veg food, pool, pick-up from airport…" />
            </Field>
          </div>

          {/* Honeypot */}
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />

          <label className="flex items-start gap-2 text-xs">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-rose-500" />
            <span className="muted">
              I agree to be contacted about this trip on WhatsApp/phone/email. See our{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </span>
          </label>

          {status.kind === "error" && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{status.message}</p>}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <button type="submit" disabled={status.kind === "sending"} className="btn-primary !min-h-[50px] text-base">
              {status.kind === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : null} Get my free quotes
            </button>
            <a href={whatsappLink(waText)} target="_blank" rel="noopener noreferrer" className="btn border border-[var(--line)]">
              <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp instead
            </a>
          </div>
        </form>
      )}
    </Sheet>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      {children}
    </label>
  );
}
