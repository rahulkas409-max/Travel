"use client";

import { Check, Copy, KeyRound, Loader2, X } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/format";
import { whatsappLink } from "@/lib/payments";
import { copyText } from "@/lib/share";

/** Owner tools: setup checklist + issue Pro access codes after a payment. Protected by ADMIN_PASSWORD. */
export function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Record<string, boolean | number> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tag, setTag] = useState("");
  const [days, setDays] = useState(60);
  const [phone, setPhone] = useState("");
  const [issued, setIssued] = useState<{ code: string; expires: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const call = async (body: object) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, ...body }) });
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Failed");
      return data;
    } catch {
      setError("Network error");
      return null;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader eyebrow="Admin" title="Owner tools" />
      {!status ? (
        <form
          className="glass flex gap-2 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const d = await call({ action: "status" });
            if (d?.ok) setStatus(d.status);
          }}
        >
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="input" autoComplete="current-password" />
          <button type="submit" disabled={busy || !password} className="btn-primary shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Sign in
          </button>
        </form>
      ) : (
        <>
          <section className="glass p-5">
            <h2 className="font-display text-xl font-bold">Setup checklist</h2>
            <p className="muted text-xs">Add missing values in Vercel → Settings → Environment Variables, then redeploy. See .env.example.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {Object.entries(status).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  {v ? <Check className="h-4 w-4 text-sage-500" /> : <X className="h-4 w-4 text-rose-500" />}
                  <span className={cn(!v && "muted")}>{k}</span>
                  {typeof v === "number" && <span className="muted text-xs">({v} configured)</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass space-y-3 p-5">
            <h2 className="font-display text-xl font-bold">Issue a Pro access code</h2>
            <p className="muted text-xs">After you receive a payment, create a code and send it to the buyer.</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag e.g. DPSNOIDA" className="input uppercase" maxLength={8} />
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input">
                <option value={60}>Single trip · 60 days</option>
                <option value={366}>Yearly · 366 days</option>
                <option value={7}>Trial · 7 days</option>
              </select>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Buyer WhatsApp (optional)" className="input" />
            </div>
            <button
              type="button"
              disabled={busy}
              className="btn-primary w-full"
              onClick={async () => {
                const d = await call({ action: "issue", tag, days });
                if (d?.ok) setIssued({ code: d.code, expires: d.expires });
              }}
            >
              Generate code
            </button>
            {issued && (
              <div className="rounded-2xl bg-slate-900 p-4 text-white dark:bg-white/10">
                <p className="font-mono text-lg font-bold">{issued.code}</p>
                <p className="text-xs text-white/70">Valid until {issued.expires}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn bg-white/15 !min-h-[38px] !text-xs"
                    onClick={async () => {
                      if (await copyText(issued.code)) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }
                    }}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy
                  </button>
                  <a
                    className="btn bg-[#25D366] !min-h-[38px] !text-xs text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "https://wa.me/"}?text=${encodeURIComponent(`Thanks for buying RoamIndia Organiser Pro! 🎉\nYour code: ${issued.code}\nValid till ${issued.expires}.\nOpen the Export page → Organiser Pro → enter the code.`)}`}
                  >
                    Send on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </section>
          <p className="muted text-center text-xs">
            Enquiries arrive in your webhook sheet / Supabase table, or on WhatsApp.{" "}
            <a className="underline" href={whatsappLink("test")} target="_blank" rel="noopener noreferrer">
              Test WhatsApp link
            </a>
          </p>
        </>
      )}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}
    </div>
  );
}
