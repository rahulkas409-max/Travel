"use client";

import { Building2, Crown, ImagePlus, Loader2, Lock, LogOut, Trash2, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PLANS } from "@/config/business";
import { useTrip } from "@/context/TripContext";
import { sound } from "@/lib/audio";
import { cn, inr } from "@/lib/format";
import { fileToLogo, usePro } from "@/lib/pro";

/** Organiser Pro: unlock with a code, then brand the PDF, add a group roster and per-person cost split. */
export function ProPanel() {
  const { isPro, pro, unlock, signOut, branding, setBranding, costs, setCosts } = usePro();
  const { config, toast } = useTrip();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const nights = Math.max(1, config.days - 1);
  const people = Math.max(1, config.travellers);
  const perPerson =
    (costs.stayPerNight * nights + costs.transportTotal + costs.extrasTotal) / people + costs.foodPerPersonPerDay * config.days + costs.activitiesPerPerson;

  return (
    <div className={cn("rounded-3xl border-2 p-5", isPro ? "border-marigold-400 bg-marigold-50/50 dark:bg-marigold-500/5" : "border-dashed border-[var(--line)]")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-display text-xl font-bold">
            <Crown className="h-5 w-5 text-marigold-500" /> Organiser Pro
          </p>
          <p className="muted mt-0.5 text-sm">For schools, HR teams & travel agents — branded PDF, group roster and cost split.</p>
        </div>
        {isPro ? (
          <button type="button" onClick={signOut} className="muted inline-flex shrink-0 items-center gap-1 text-xs hover:text-rose-500">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-white/15">from {inr(PLANS.proTrip.price)}</span>
        )}
      </div>

      {!isPro ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ul className="space-y-2 text-sm">
            {[
              ["🏷️", "Your school / company name & logo on every PDF page"],
              ["🧾", "Group roster: names, phones, rooms, emergency contacts, consent"],
              ["💰", "Per-person cost split — stay, transport, food, tickets"],
              ["🚫", "Remove RoamIndia branding from the dossier"],
            ].map(([e, t]) => (
              <li key={t} className="flex gap-2">
                <span>{e}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const r = await unlock(code);
                setBusy(false);
                setMsg({ ok: r.ok, text: r.message });
                sound.play(r.ok ? "chime" : "error");
                if (r.ok) toast("👑 Organiser Pro unlocked", "success");
              }}
            >
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="RI-XXXX-YYYYMMDD-CODE" className="input font-mono uppercase" aria-label="Pro access code" />
              <button type="submit" disabled={busy || code.length < 8} className="btn-primary shrink-0">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Unlock
              </button>
            </form>
            {msg && <p className={cn("text-xs", msg.ok ? "text-sage-600" : "text-rose-600")}>{msg.text}</p>}
            <Link href="/pro" className="btn-ghost w-full">
              Get Pro — {inr(PLANS.proTrip.price)}/trip or {inr(PLANS.proYear.price)}/year
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          <p className="text-xs font-semibold text-sage-700 dark:text-sage-300">✓ Active until {pro && new Date(`${pro.expires}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>

          <Section icon={<Building2 className="h-4 w-4" />} title="Branding">
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <label className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--line)] bg-white/60 dark:bg-white/5">
                {branding.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={branding.logo} alt="Logo" className="h-full w-full object-contain p-1" />
                ) : (
                  <ImagePlus className="h-6 w-6 opacity-50" />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setBranding({ logo: await fileToLogo(f) });
                    } catch {
                      toast("That image couldn't be read", "warn");
                    }
                  }}
                  aria-label="Upload logo"
                />
              </label>
              <div className="space-y-2">
                <input value={branding.orgName} onChange={(e) => setBranding({ orgName: e.target.value })} placeholder="School / company / agency name" className="input" />
                <input value={branding.preparedBy ?? ""} onChange={(e) => setBranding({ preparedBy: e.target.value })} placeholder="Prepared by (e.g. Mrs. Iyer, Trip Coordinator)" className="input" />
                {branding.logo && (
                  <button type="button" onClick={() => setBranding({ logo: undefined })} className="muted inline-flex items-center gap-1 text-xs hover:text-rose-500">
                    <Trash2 className="h-3 w-3" /> Remove logo
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <Check label="Hide RoamIndia branding" on={branding.hideRoamIndia} set={(v) => setBranding({ hideRoamIndia: v })} />
              <Check label="Add group roster page" on={branding.includeRoster} set={(v) => setBranding({ includeRoster: v })} />
              <Check label="Add cost-split page" on={branding.includeCosts} set={(v) => setBranding({ includeCosts: v })} />
            </div>
          </Section>

          <Section icon={<Wallet className="h-4 w-4" />} title={`Cost split · ${people} people · ${nights} nights`}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Money label="Stay per night (total)" value={costs.stayPerNight} set={(v) => setCosts({ stayPerNight: v })} />
              <Money label="Transport (total)" value={costs.transportTotal} set={(v) => setCosts({ transportTotal: v })} />
              <Money label="Food / person / day" value={costs.foodPerPersonPerDay} set={(v) => setCosts({ foodPerPersonPerDay: v })} />
              <Money label="Tickets / person" value={costs.activitiesPerPerson} set={(v) => setCosts({ activitiesPerPerson: v })} />
              <Money label="Extras (total)" value={costs.extrasTotal} set={(v) => setCosts({ extrasTotal: v })} />
              <div className="flex flex-col justify-center rounded-xl bg-slate-900 px-3 py-2 text-white dark:bg-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Per person</span>
                <span className="text-xl font-extrabold tabular-nums">{inr(perPerson)}</span>
              </div>
            </div>
          </Section>

          <p className="muted flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> The roster prints {people} rows (change group size in the Vibe Bar above). Branding & costs stay on this device.
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-70">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

function Check({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-rose-500" />
      {label}
    </label>
  );
}

function Money({ label, value, set }: { label: string; value: number; set: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      <input type="number" inputMode="numeric" min={0} step={100} value={value || ""} onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))} placeholder="₹0" className="input !h-10" />
    </label>
  );
}
