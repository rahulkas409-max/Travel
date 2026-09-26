import { BUSINESS, PLANS, type Plan, type PlanId } from "@/config/business";

/** upi://pay deep link — opens GPay / PhonePe / Paytm / BHIM with amount prefilled (0% MDR). */
export function upiLink(amount: number, note: string): string | null {
  if (!BUSINESS.upiId) return null;
  // Some UPI apps reject non-ASCII in the payee name / note, so keep them plain.
  const ascii = (s: string) => s.replace(/[^A-Za-z0-9 .-]/g, " ").replace(/\s+/g, " ").trim();
  const p = new URLSearchParams({ pa: BUSINESS.upiId, pn: ascii(BUSINESS.upiName), am: amount.toFixed(2), cu: "INR", tn: ascii(note).slice(0, 60) });
  return `upi://pay?${p.toString()}`;
}

export function whatsappLink(text: string): string {
  const base = BUSINESS.whatsapp ? `https://wa.me/${BUSINESS.whatsapp}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function mailLink(subject: string, body: string): string | null {
  if (!BUSINESS.email) return null;
  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type PayMethod = { kind: "razorpay" | "upi" | "whatsapp"; href: string; label: string };

/** Best available ways to pay for a plan, in order of preference. */
export function payMethods(id: PlanId, ref?: string): PayMethod[] {
  const plan: Plan = PLANS[id];
  const note = `${BUSINESS.name} ${plan.name}${ref ? ` ${ref}` : ""}`;
  const out: PayMethod[] = [];
  if (plan.razorpayLink) out.push({ kind: "razorpay", href: plan.razorpayLink, label: "Pay securely (UPI / card / netbanking)" });
  const upi = upiLink(plan.price, note);
  if (upi) out.push({ kind: "upi", href: upi, label: "Pay with any UPI app" });
  out.push({
    kind: "whatsapp",
    href: whatsappLink(`Hi ${BUSINESS.name}! I'd like ${plan.name} (₹${plan.price} ${plan.unit}).${ref ? ` Ref: ${ref}` : ""}`),
    label: out.length ? "Paid? Send the reference on WhatsApp" : "Request on WhatsApp",
  });
  return out;
}

export function paymentsConfigured(): boolean {
  return !!(BUSINESS.upiId || Object.values(PLANS).some((p) => p.razorpayLink));
}
