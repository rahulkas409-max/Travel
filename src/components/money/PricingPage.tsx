"use client";

import { Check, Crown, Heart, Home, Users } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Sheet } from "@/components/ui/Sheet";
import { MARKET_REFERENCE, PLANS, SUCCESS_FEE_PERCENT, type PlanId } from "@/config/business";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";
import { PayOptions } from "./PayOptions";

export function PricingPage() {
  const [buy, setBuy] = useState<PlanId | null>(null);
  const open = (id: PlanId) => {
    sound.play("pop");
    setBuy(id);
  };

  return (
    <div className="space-y-12">
      <PageHeader eyebrow="Pricing" title="Free for travellers. Fair for everyone else.">
        Planning, itineraries, PDFs, roulette and photos are free forever — no login, no paywall. We earn tiny, transparent fees from properties and organisers, far below typical booking-portal commissions.
      </PageHeader>

      {/* Travellers */}
      <section className="rounded-3xl bg-gradient-to-br from-sage-500 to-sage-700 p-6 text-white shadow-lift sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-100">For travellers</p>
            <p className="mt-1 font-display text-4xl font-bold">₹0 · forever</p>
            <p className="mt-1 text-sm text-white/85">Itineraries, stays & reviews, food, transit, roulette, A4 PDF, WhatsApp share, photo downloads, group quotes.</p>
          </div>
          <Link href="/" className="btn shrink-0 bg-white text-slate-900 hover:bg-sand-100">
            Start planning
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section>
        <h2 className="section-title mb-4">For organisers & properties</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <PlanCard
            icon={<Crown className="h-5 w-5" />}
            title="Organiser Pro"
            price={`${inr(PLANS.proTrip.price)}`}
            unit="per trip"
            alt={`or ${inr(PLANS.proYear.price)}/year — unlimited trips`}
            highlight
            features={["Your logo & name on the PDF", "Remove RoamIndia branding", "Group roster + parent consent", "Per-person cost split", "For schools, HR & agents"]}
            actions={
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="btn-primary" onClick={() => open("proTrip")}>
                  {inr(PLANS.proTrip.price)} / trip
                </button>
                <button type="button" className="btn-ghost" onClick={() => open("proYear")}>
                  {inr(PLANS.proYear.price)} / year
                </button>
              </div>
            }
          />
          <PlanCard
            icon={<Home className="h-5 w-5" />}
            title="Property listing"
            price="₹0"
            unit="to list"
            alt={`Verified ${inr(PLANS.verified.price)}/mo · Featured ${inr(PLANS.featured.price)}/mo`}
            features={["Free basic listing", "Verified badge + direct contact", "Featured at top (labelled Sponsored)", "No commission on your own bookings", "Cancel anytime"]}
            actions={
              <div className="grid grid-cols-2 gap-2">
                <Link href="/partner" className="btn-primary">
                  List free
                </Link>
                <button type="button" className="btn-ghost" onClick={() => open("verified")}>
                  Verified {inr(PLANS.verified.price)}
                </button>
              </div>
            }
          />
          <PlanCard
            icon={<Users className="h-5 w-5" />}
            title="Group enquiries"
            price={inr(PLANS.lead.price)}
            unit="per verified enquiry"
            alt={`or ${SUCCESS_FEE_PERCENT}% only when a booking is confirmed`}
            features={["Offsite & school groups", "Dates, size & budget included", "Delivered on WhatsApp", "Pay only for real enquiries", "Travellers never pay"]}
            actions={
              <Link href="/partner?plan=leads" className="btn-primary w-full">
                Receive enquiries
              </Link>
            }
          />
        </div>
      </section>

      {/* Comparison */}
      <section>
        <h2 className="section-title mb-1">How we compare</h2>
        <p className="muted mb-4 text-sm">Approximate industry ranges for context — check each platform&apos;s current terms.</p>
        <div className="glass overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider opacity-70">
                <th className="p-3">What you pay</th>
                <th className="p-3">Typical elsewhere</th>
                <th className="p-3 text-rose-600 dark:text-rose-300">RoamIndia</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Commission per room booking (property)", `${MARKET_REFERENCE.otaCommission} of booking value`, `0% on direct bookings · ${SUCCESS_FEE_PERCENT}% only on group leads`],
                ["Listing / visibility for a farmhouse", `${MARKET_REFERENCE.listingPortalYearly} / year on listing portals`, `Free · Verified ${inr(PLANS.verified.price * 12)}/yr`],
                ["Group-trip planning help", `${MARKET_REFERENCE.groupPlannerFee} per trip`, `Free quotes · Pro ${inr(PLANS.proTrip.price)}/trip`],
                ["Trip planner for travellers", "Free with upsells / logins", "Free · no login · no paywall"],
              ].map(([k, them, us]) => (
                <tr key={k} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-3 font-semibold">{k}</td>
                  <td className="muted p-3">{them}</td>
                  <td className="p-3 font-bold text-sage-700 dark:text-sage-300">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="grid gap-3 md:grid-cols-2">
        {[
          ["Will travellers ever have to pay?", "No. Planning, PDFs and quotes stay free. Only organisers who want branded documents, and properties who want visibility or leads, pay."],
          ["How do payments work?", "UPI (0% fees) straight to us, or a secure Razorpay checkout for cards and netbanking. You get an access code or activation on WhatsApp within a few hours."],
          ["Do paid listings affect ratings?", "Never. Featured listings are clearly labelled Sponsored and appear in a separate slot. Ratings and the roulette are not for sale."],
          ["Can I cancel?", "Yes — monthly plans stop when you stop paying. Pro trip codes simply expire."],
        ].map(([q, a]) => (
          <div key={q} className="glass p-4">
            <p className="font-bold">{q}</p>
            <p className="muted mt-1 text-sm">{a}</p>
          </div>
        ))}
      </section>

      <p className="muted flex items-center justify-center gap-1.5 text-center text-xs">
        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> Prices include no hidden charges. GST applied where applicable.
      </p>

      <Sheet open={!!buy} onClose={() => setBuy(null)} title="Checkout" subtitle="UPI (0% fee) or secure card checkout">
        {buy && <PayOptions plan={buy} />}
      </Sheet>
    </div>
  );
}

function PlanCard({ icon, title, price, unit, alt, features, actions, highlight }: { icon: ReactNode; title: string; price: string; unit: string; alt: string; features: string[]; actions: ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("flex flex-col rounded-3xl p-5", highlight ? "border-2 border-marigold-400 bg-white shadow-lift dark:bg-slate-900" : "glass")}>
      <p className="flex items-center gap-2 font-bold">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-marigold-400 to-rose-500 text-white">{icon}</span>
        {title}
        {highlight && <span className="pill ml-auto bg-marigold-100 text-marigold-700">Popular</span>}
      </p>
      <p className="mt-4 text-4xl font-extrabold tabular-nums">
        {price} <span className="text-sm font-medium opacity-60">{unit}</span>
      </p>
      <p className="muted text-xs">{alt}</p>
      <ul className="my-4 flex-1 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" /> {f}
          </li>
        ))}
      </ul>
      {actions}
    </div>
  );
}

