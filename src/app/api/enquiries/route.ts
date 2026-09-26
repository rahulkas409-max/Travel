import { NextResponse } from "next/server";
import { deliverEnquiry, type EnquiryRecord } from "@/lib/server/enquiries";
import { clientIp, rateLimited } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const num = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : undefined;
};

/** Receives group/property enquiries and host listing requests. */
export async function POST(req: Request) {
  if (rateLimited(`enq:${clientIp(req)}`, 12, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests — please try again in a few minutes." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  // Honeypot: real users never fill this hidden field.
  if (str(body.website)) return NextResponse.json({ ok: true, id: "RI-OK", stored: false });

  const type = body.type === "property" || body.type === "listing" ? body.type : "group";
  const name = str(body.name, 80);
  const phone = str(body.phone, 20)?.replace(/[^\d+]/g, "");
  const email = str(body.email, 120);
  if (!name || name.length < 2) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!phone || phone.replace(/\D/g, "").length < 10) return NextResponse.json({ ok: false, error: "Please enter a valid phone / WhatsApp number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email or leave it blank." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ ok: false, error: "Please agree to be contacted." }, { status: 400 });
  if (type === "listing" && !str(body.businessName)) return NextResponse.json({ ok: false, error: "Please enter your property name." }, { status: 400 });

  const rec: EnquiryRecord = {
    id: `RI-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase()}`,
    type,
    createdAt: new Date().toISOString(),
    name,
    phone,
    email,
    destinationId: str(body.destinationId, 60),
    destinationName: str(body.destinationName, 80),
    propertyId: str(body.propertyId, 60),
    propertyName: str(body.propertyName, 120),
    occasion: str(body.occasion, 30),
    groupSize: num(body.groupSize, 1, 2000),
    startDate: str(body.startDate, 10),
    nights: num(body.nights, 0, 60),
    budgetPerPerson: num(body.budgetPerPerson, 0, 1_000_000),
    message: str(body.message, 1000),
    businessName: str(body.businessName, 120),
    city: str(body.city, 80),
    propertyType: str(body.propertyType, 40),
    plan: str(body.plan, 20),
    source: str(body.source, 60) ?? "web",
  };

  const result = await deliverEnquiry(rec);
  return NextResponse.json({ ok: true, id: rec.id, stored: result.stored });
}
