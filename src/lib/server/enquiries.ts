import "server-only";

/** A lead / enquiry captured by RoamIndia (group quote, property enquiry or host listing). */
export interface EnquiryRecord {
  id: string;
  type: "group" | "property" | "listing";
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  destinationId?: string;
  destinationName?: string;
  propertyId?: string;
  propertyName?: string;
  occasion?: string;
  groupSize?: number;
  startDate?: string;
  nights?: number;
  budgetPerPerson?: number;
  message?: string;
  /** Host listing fields */
  businessName?: string;
  city?: string;
  propertyType?: string;
  plan?: string;
  source: string;
}

export interface DeliveryResult {
  stored: boolean;
  channels: string[];
}

/**
 * Deliver an enquiry to every configured sink. Zero-infrastructure by default:
 *  - ENQUIRY_WEBHOOK_URL → POST JSON (Google Sheets via Apps Script, Zapier, Make, Slack, Discord…)
 *  - SUPABASE_URL + SUPABASE_SERVICE_KEY → insert into the `enquiries` table
 * When nothing is configured the client falls back to WhatsApp, so no lead is ever lost.
 */
export async function deliverEnquiry(rec: EnquiryRecord): Promise<DeliveryResult> {
  const channels: string[] = [];
  const tasks: Promise<void>[] = [];

  const hook = process.env.ENQUIRY_WEBHOOK_URL;
  if (hook) {
    tasks.push(
      fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rec, text: summary(rec), content: summary(rec) }),
        signal: AbortSignal.timeout(8000),
      }).then((r) => {
        if (r.ok || r.status === 302) channels.push("webhook");
      }),
    );
  }

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (sbUrl && sbKey) {
    tasks.push(
      fetch(`${sbUrl.replace(/\/$/, "")}/rest/v1/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ id: rec.id, type: rec.type, created_at: rec.createdAt, payload: rec }),
        signal: AbortSignal.timeout(8000),
      }).then((r) => {
        if (r.ok) channels.push("supabase");
      }),
    );
  }

  await Promise.allSettled(tasks);
  return { stored: channels.length > 0, channels };
}

/** Human-readable one-liner (also used by Slack/Discord webhooks via `text` / `content`). */
export function summary(r: EnquiryRecord): string {
  if (r.type === "listing")
    return `🏡 New listing request ${r.id}: ${r.businessName} (${r.propertyType}) in ${r.city} — plan ${r.plan ?? "free"} — ${r.name}, ${r.phone}`;
  return `📩 New ${r.type === "property" ? "property" : "group"} enquiry ${r.id}: ${r.destinationName ?? ""}${r.propertyName ? ` · ${r.propertyName}` : ""} · ${r.occasion ?? ""} · ${r.groupSize ?? "?"} people · ${r.startDate ?? "flexible"} · ₹${r.budgetPerPerson ?? "?"}/pp/day — ${r.name}, ${r.phone}`;
}
