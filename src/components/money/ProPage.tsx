"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PLANS, type PlanId } from "@/config/business";
import { cn, inr } from "@/lib/format";
import { usePro } from "@/lib/pro";
import { PayOptions } from "./PayOptions";
import { ProPanel } from "./ProPanel";

export function ProPage() {
  const { isPro } = usePro();
  const [plan, setPlan] = useState<PlanId>("proTrip");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Organiser Pro" title="Branded trip dossiers in one tap">
        For school trip coordinators, HR & offsite planners and travel agents. Travellers never need Pro — the planner and standard PDF stay free.
      </PageHeader>

      {isPro ? (
        <div className="glass flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">👑 Pro is active on this device. Set your logo and costs, then export.</p>
          <Link href="/export" className="btn-primary">
            Go to Export <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(["proTrip", "proYear"] as PlanId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlan(id)}
                  className={cn("rounded-3xl border-2 p-4 text-left transition", plan === id ? "border-rose-500 bg-rose-50 dark:bg-rose-500/10" : "border-[var(--line)]")}
                  aria-pressed={plan === id}
                >
                  <p className="text-sm font-bold">{id === "proTrip" ? "Single trip" : "Yearly · unlimited"}</p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums">{inr(PLANS[id].price)}</p>
                  <p className="muted text-xs">{id === "proTrip" ? "Valid 60 days" : "Best for schools & agents"}</p>
                </button>
              ))}
            </div>
            <ol className="glass space-y-2 p-5 text-sm">
              <li>
                <b>1.</b> Pay {inr(PLANS[plan].price)} by UPI (0% fee) or card.
              </li>
              <li>
                <b>2.</b> Send the payment reference on WhatsApp — you&apos;ll receive a code like <code className="font-mono">RI-SCHOOL-20271231-XXXX</code>.
              </li>
              <li>
                <b>3.</b> Enter the code below to unlock branding, roster and cost split on this device.
              </li>
            </ol>
            <ProPanel showBuyLink={false} />
          </div>
          <aside>
            <PayOptions plan={plan} />
          </aside>
        </div>
      )}
      {isPro && <ProPanel showBuyLink={false} />}
    </div>
  );
}
