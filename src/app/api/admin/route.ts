import { NextResponse } from "next/server";
import { AFFILIATE, BUSINESS, PLANS } from "@/config/business";
import { checkAdmin, issueCode, proConfigured } from "@/lib/server/proCodes";
import { clientIp, rateLimited } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

/** Admin actions: `status` (setup checklist) and `issue` (create a Pro access code). */
export async function POST(req: Request) {
  if (rateLimited(`admin:${clientIp(req)}`, 20, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD is not set in the environment." }, { status: 503 });
  if (!checkAdmin(body.password)) return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });

  if (body.action === "issue") {
    const days = Number(body.days) || 30;
    const issued = issueCode(String(body.tag ?? "PRO"), days);
    if (!issued) return NextResponse.json({ ok: false, error: "PRO_SECRET is not set (min 12 characters)." }, { status: 503 });
    return NextResponse.json({ ok: true, ...issued });
  }

  return NextResponse.json({
    ok: true,
    status: {
      "WhatsApp number": !!BUSINESS.whatsapp,
      "Contact email": !!BUSINESS.email,
      "UPI ID (0% fee payments)": !!BUSINESS.upiId,
      "Razorpay links": Object.values(PLANS).filter((p) => p.razorpayLink).length,
      "Booking.com affiliate ID": !!AFFILIATE.bookingAid,
      "GetYourGuide partner ID": !!AFFILIATE.getYourGuidePartnerId,
      "Klook affiliate ID": !!AFFILIATE.klookAid,
      "Enquiry webhook": !!process.env.ENQUIRY_WEBHOOK_URL,
      "Supabase storage": !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY),
      "Pro code signing (PRO_SECRET)": proConfigured(),
    },
  });
}
