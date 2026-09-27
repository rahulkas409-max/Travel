"use client";

import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageCircle, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BUSINESS } from "@/config/business";
import { sound } from "@/lib/audio";
import { cn } from "@/lib/format";
import { whatsappLink } from "@/lib/payments";

const CATEGORIES = [
  { id: "general", label: "General question" },
  { id: "complaint", label: "Complaint about a listing / partner" },
  { id: "payment", label: "Payment, cancellation or refund" },
  { id: "data-access", label: "Data: get a copy of my data" },
  { id: "data-correct", label: "Data: correct my data" },
  { id: "data-erase", label: "Data: delete my data" },
  { id: "withdraw-consent", label: "Withdraw my consent" },
  { id: "content", label: "Report content / copyright" },
];

/** Contact details, Grievance Officer and a grievance / data-rights request form. */
export function ContactPage() {
  const params = useSearchParams();
  const initial = CATEGORIES.some((c) => c.id === params.get("topic")) ? (params.get("topic") as string) : "general";
  const [category, setCategory] = useState(initial);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<{ kind: "idle" | "sending" | "error" | "done"; msg?: string; id?: string }>({ kind: "idle" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "grievance", category, ...form, consent, source: "contact-page" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setState({ kind: "error", msg: data.error ?? "Couldn't submit — please email or WhatsApp us." });
      setState({ kind: "done", id: data.id });
      sound.play("success");
    } catch {
      setState({ kind: "error", msg: "You seem to be offline — please email or WhatsApp us." });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Contact & grievances" title="We're here to help">
        Questions, complaints or data requests — we acknowledge every grievance within 48 hours and aim to resolve it within 30 days.
      </PageHeader>

      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[1fr_360px]">
        <div className="glass p-5">
          {state.kind === "done" ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-sage-500" />
              <p className="mt-3 text-2xl font-extrabold">Request received</p>
              <p className="muted mt-1 text-sm">
                Ticket <b className="font-mono text-[var(--ink)]">{state.id}</b>. Please keep it for reference — we&apos;ll acknowledge within 48 hours.
              </p>
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
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider opacity-60">Topic</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      aria-pressed={category === c.id}
                      className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", category === c.id ? "border-rose-500 bg-rose-500 text-white" : "border-[var(--line)] hover:bg-white/60 dark:hover:bg-white/5")}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Your name">
                  <input required minLength={2} autoComplete="name" value={form.name} onChange={set("name")} className="input" />
                </F>
                <F label="Phone / WhatsApp">
                  <input required type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className="input" />
                </F>
                <F label="Email (for a written reply)" className="sm:col-span-2">
                  <input type="email" autoComplete="email" value={form.email} onChange={set("email")} className="input" />
                </F>
                <F label="Details" className="sm:col-span-2">
                  <textarea
                    required
                    minLength={10}
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    className="input resize-y"
                    placeholder={category.startsWith("data") || category === "withdraw-consent" ? "The phone/email you used and your request reference (if any)." : "What happened, when, and the listing / reference involved."}
                  />
                </F>
              </div>
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden />
              <label className="flex items-start gap-2 text-xs">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-rose-500" />
                <span className="muted">
                  I consent to {BUSINESS.name} using these details only to respond to this request, as described in the{" "}
                  <Link href="/privacy" className="underline">
                    privacy notice
                  </Link>
                  .
                </span>
              </label>
              {state.kind === "error" && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{state.msg}</p>}
              <button type="submit" disabled={state.kind === "sending" || !consent} className="btn-primary w-full !min-h-[50px] text-base">
                {state.kind === "sending" && <Loader2 className="h-5 w-5 animate-spin" />} Submit request
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-3 break-words">
          <Card icon={<Scale className="h-5 w-5" />} title="Grievance Officer">
            <p className="font-semibold">{BUSINESS.grievanceOfficer ?? `Grievance Officer, ${BUSINESS.legalName}`}</p>
            {BUSINESS.grievanceEmail && (
              <a href={`mailto:${BUSINESS.grievanceEmail}`} className="text-rose-700 underline dark:text-rose-300">
                {BUSINESS.grievanceEmail}
              </a>
            )}
            <p className="muted mt-1 text-xs">Under the IT Rules 2021, Consumer Protection (E-Commerce) Rules 2020 and DPDP Act 2023.</p>
          </Card>
          <Card icon={<Clock className="h-5 w-5" />} title="Timelines">
            <ul className="space-y-1 text-sm">
              <li>Acknowledgement: within 48 hours</li>
              <li>Resolution: within 30 days</li>
              <li>Data requests: as soon as practicable, within 30 days</li>
            </ul>
          </Card>
          <Card icon={<Mail className="h-5 w-5" />} title="Contact">
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{BUSINESS.legalName}</p>
              {BUSINESS.address && (
                <p className="flex gap-1.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-60" /> {BUSINESS.address}
                </p>
              )}
              {BUSINESS.email && (
                <a href={`mailto:${BUSINESS.email}`} className="block text-rose-700 underline dark:text-rose-300">
                  {BUSINESS.email}
                </a>
              )}
              {BUSINESS.whatsapp && (
                <a href={whatsappLink("Hi RoamIndia!")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp +{BUSINESS.whatsapp}
                </a>
              )}
              {BUSINESS.gstin && <p className="muted text-xs">GSTIN: {BUSINESS.gstin}</p>}
            </div>
          </Card>
          <Card icon={<ShieldCheck className="h-5 w-5" />} title="Still unresolved?">
            <p className="text-sm">
              You can approach the National Consumer Helpline (dial <a href="tel:1915" className="font-bold">1915</a> or visit consumerhelpline.gov.in), and for personal-data issues the Data
              Protection Board of India.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="glass p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-extrabold">
        <span className="text-rose-500">{icon}</span> {title}
      </p>
      {children}
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
