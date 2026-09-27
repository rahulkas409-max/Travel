/**
 * Business & monetisation settings.
 *
 * Everything is configured with environment variables (Vercel → Project →
 * Settings → Environment Variables) so no code change is needed to go live.
 * NEXT_PUBLIC_* values are safe to expose in the browser; secrets (webhook
 * URLs, Supabase key, PRO_SECRET, ADMIN_PASSWORD) are read only on the server.
 *
 * Every feature degrades gracefully when a value is missing: e.g. without a
 * Razorpay link we show UPI; without UPI we fall back to WhatsApp.
 */

const env = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export const BUSINESS = {
  name: env(process.env.NEXT_PUBLIC_BUSINESS_NAME) ?? "RoamIndia",
  siteUrl: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://travel-delta-nine-17.vercel.app",
  /** International format without "+", e.g. 919876543210 */
  whatsapp: env(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP),
  email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /** UPI VPA for direct, zero-fee payments, e.g. roamindia@okhdfcbank */
  upiId: env(process.env.NEXT_PUBLIC_UPI_ID),
  upiName: env(process.env.NEXT_PUBLIC_UPI_NAME) ?? "RoamIndia",
  gstin: env(process.env.NEXT_PUBLIC_GSTIN),
  /** Registered legal name (e.g. "RoamIndia Travel Tech Pvt Ltd" or proprietor name). */
  legalName: env(process.env.NEXT_PUBLIC_LEGAL_NAME) ?? env(process.env.NEXT_PUBLIC_BUSINESS_NAME) ?? "RoamIndia",
  /** Postal address — required on e-commerce / contact pages under Indian consumer rules. */
  address: env(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS),
  /** Grievance Officer (IT Rules 2021, Consumer Protection (E-Commerce) Rules 2020, DPDP Act 2023). */
  grievanceOfficer: env(process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER),
  grievanceEmail: env(process.env.NEXT_PUBLIC_GRIEVANCE_EMAIL) ?? env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /** Courts with jurisdiction for the Terms (e.g. "Pune, Maharashtra"). */
  jurisdiction: env(process.env.NEXT_PUBLIC_JURISDICTION) ?? "the city of the business's registered office, India",
};

/** Affiliate / partner IDs appended to outbound booking links. */
export const AFFILIATE = {
  bookingAid: env(process.env.NEXT_PUBLIC_BOOKING_AID),
  getYourGuidePartnerId: env(process.env.NEXT_PUBLIC_GYG_PARTNER_ID),
  klookAid: env(process.env.NEXT_PUBLIC_KLOOK_AID),
};

export type PlanId = "proTrip" | "proYear" | "verified" | "featured" | "lead" | "support";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  unit: string;
  /** Optional Razorpay Payment Link / Page for card + UPI + netbanking checkout. */
  razorpayLink?: string;
}

/**
 * Deliberately low prices — RoamIndia earns mainly from volume and partner
 * commissions, never by charging travellers for planning.
 */
export const PLANS: Record<PlanId, Plan> = {
  proTrip: { id: "proTrip", name: "Organiser Pro · single trip", price: 149, unit: "per trip", razorpayLink: env(process.env.NEXT_PUBLIC_RZP_LINK_PRO_TRIP) },
  proYear: { id: "proYear", name: "Organiser Pro · yearly", price: 999, unit: "per year", razorpayLink: env(process.env.NEXT_PUBLIC_RZP_LINK_PRO_YEAR) },
  verified: { id: "verified", name: "Verified listing", price: 499, unit: "per month", razorpayLink: env(process.env.NEXT_PUBLIC_RZP_LINK_VERIFIED) },
  featured: { id: "featured", name: "Featured listing", price: 999, unit: "per month", razorpayLink: env(process.env.NEXT_PUBLIC_RZP_LINK_FEATURED) },
  lead: { id: "lead", name: "Verified group enquiry", price: 149, unit: "per enquiry", razorpayLink: env(process.env.NEXT_PUBLIC_RZP_LINK_LEAD) },
  support: { id: "support", name: "Support RoamIndia", price: 49, unit: "one-time", razorpayLink: env(process.env.NEXT_PUBLIC_RZP_LINK_SUPPORT) },
};

/** Success fee alternative to per-enquiry pricing (charged to the property, never the traveller). */
export const SUCCESS_FEE_PERCENT = 3;

/** Industry reference points used on the pricing page (approximate, publicly discussed ranges). */
export const MARKET_REFERENCE = {
  otaCommission: "15–25%",
  listingPortalYearly: "₹10,000+",
  groupPlannerFee: "₹2,000–10,000",
};
