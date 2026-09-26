"use client";

import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BUSINESS, PLANS, SUCCESS_FEE_PERCENT, type PlanId } from "@/config/business";
import { sound } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { cn, inr } from "@/lib/format";
import { whatsappLink } from "@/lib/payments";
import { PayOptions } from "./PayOptions";

const TYPES = ["Private Farmhouse", "Agro-Tourism Farm", "Plantation Estate", "Homestay", "Boutique Hostel", "Heritage Haveli", "Resort / Villa", "Jungle Lodge", "Camp / Tents"];

const CHOICES: { id: "free" | "verified" | "featured" | "leads"; title: string; price: string; note: string }[] = [
  { id: "free", title: "Free listing", price: "₹0", note: "Basic profile, reviewed by us" },
  { id: "verified", title: "Verified", price: `${inr(PLANS.verified.price)}/mo`, note: "Badge + direct contact button" },
  { id: "featured", title: "Featured", price: `${inr(PLANS.featured.price)}/mo`, note: "Top slot, labelled Sponsored" },
  { id: "leads", title: "Group enquiries", price: `${inr(PLANS.lead.price)}/lead or ${SUCCESS_FEE_PERCENT}%`, note: "Offsites & school trips" },
];

export function PartnerPage() {
  const params = useSearchParams();
  const initial = (params.get("plan") as (typeof CHOICES)[number]["id"]) ?? "free";
  const [plan, setPlan] = useState<(typeof CHOICES)[number]["id"]>(CHOICES.some((c) => c.id === initial) ? initial : "free");
  const [form, setForm] = useState({ businessName: "", propertyType: TYPES[0], city: "", name: "", phone: "", email: "", message: "", website: "" });
  const [consent, setConsent] = useState(true);
  const [state, setState] = useState<{ kind: "idle" | "sending" | "error" | "done"; msg?: string; id?: string }>({ kind: "idle" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", ...form, plan, consent, source: "partner-page" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setState({ kind: "error", msg: data.error ?? "Couldn't submit — try WhatsApp." });
      setState({ kind: "done", id: data.id });
      sound.play("chime");
      void celebrate("small");
    } catch {
      setState({ kind: "error", msg: "You seem to be offline — use WhatsApp instead." });
    }
  };

  const payPlan: PlanId | null = plan === "verified" ? "verified" : plan === "featured" ? "featured" : null;
  const wa = whatsappLink(`Hi ${BUSINESS.name}! I'd like to list "${form.businessName}" (${form.propertyType}) in ${form.city} — plan: ${plan}. ${form.name}, ${form.phone}`);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="For properties" title="List your farmhouse, homestay or resort">
        Reach couples, offsite teams, school groups and friends planning trips across India. Listing is free — upgrade only if it pays off for you.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="glass p-5">
          {state.kind === "done" ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-sage-500" />
              <p className="mt-3 font-display text-2xl font-bold">Thanks — we&apos;ve got it!</p>
              <p className="muted mt-1 text-sm">
                Reference <b className="font-mono">{state.id}</b>. We&apos;ll WhatsApp you within 24 hours to collect photos and verify your property.
              </p>
              {payPlan && (
                <div className="mx-auto mt-6 max-w-sm text-left">
                  <p className="mb-2 text-sm font-bold">Activate {PLANS[payPlan].name} now</p>
                  <PayOptions plan={payPlan} reference={state.id} />
                </div>
              )}
              <Link href="/pricing" className="btn-ghost mt-4">
                See pricing
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider opacity-60">Choose a plan</p>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {CHOICES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPlan(c.id)}
                      className={cn("rounded-2xl border p-3 text-left transition", plan === c.id ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-[var(--line)] hover:bg-white/60 dark:hover:bg-white/5")}
                      aria-pressed={plan === c.id}
                    >
                      <p className="text-sm font-bold">{c.title}</p>
                      <p className="text-sm font-extrabold text-rose-600 dark:text-rose-300">{c.price}</p>
                      <p className="muted text-[11px]">{c.note}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Property name">
                  <input required value={form.businessName} onChange={set("businessName")} className="input" placeholder="Green Acres Farmhouse" />
                </F>
                <F label="Type">
                  <select value={form.propertyType} onChange={set("propertyType")} className="input">
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </F>
                <F label="Town / area">
                  <input required value={form.city} onChange={set("city")} className="input" placeholder="Karjat, Maharashtra" />
                </F>
                <F label="Your name">
                  <input required minLength={2} value={form.name} onChange={set("name")} className="input" autoComplete="name" />
                </F>
                <F label="Phone / WhatsApp">
                  <input required type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} className="input" autoComplete="tel" placeholder="+91 98xxx xxxxx" />
                </F>
                <F label="Email (optional)">
                  <input type="email" value={form.email} onChange={set("email")} className="input" autoComplete="email" />
                </F>
                <F label="Capacity, pool, hall, Wi-Fi, price range… (optional)" className="sm:col-span-2">
                  <textarea rows={3} value={form.message} onChange={set("message")} className="input resize-none" />
                </F>
              </div>
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
              <label className="flex items-start gap-2 text-xs">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-rose-500" />
                <span className="muted">
                  I own or manage this property and agree to the{" "}
                  <Link href="/terms" className="underline">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
              {state.kind === "error" && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{state.msg}</p>}
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <button type="submit" disabled={state.kind === "sending"} className="btn-primary !min-h-[50px] text-base">
                  {state.kind === "sending" && <Loader2 className="h-5 w-5 animate-spin" />} Submit listing
                </button>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-[var(--line)]">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp us
                </a>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-3">
          {[
            ["🧾", "0% commission on bookings guests make directly with you"],
            ["📣", "Shown to travellers planning trips in your area, with live weather, food & transit around you"],
            ["💼", "Offsite & school-group enquiries with dates, headcount and budget"],
            ["🔒", "Paid placements are always labelled — ratings are never for sale"],
          ].map(([e, t]) => (
            <div key={t} className="glass flex gap-3 p-4 text-sm">
              <span className="text-xl">{e}</span>
              <span>{t}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function F({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      {children}
    </label>
  );
}
