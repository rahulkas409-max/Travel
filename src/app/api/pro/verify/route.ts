import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/server/proCodes";
import { clientIp, rateLimited } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (rateLimited(`pro:${clientIp(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ ok: false, reason: "rate-limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const res = verifyCode(code);
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
