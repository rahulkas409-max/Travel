import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless Pro access codes: RI-<TAG>-<YYYYMMDD expiry>-<signature>.
 * Signed with PRO_SECRET (HMAC-SHA256), so no database is needed — the admin
 * page issues a code after payment and the app verifies it server-side.
 */

function secret(): string | null {
  const s = process.env.PRO_SECRET;
  return s && s.length >= 12 ? s : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url").replace(/[-_]/g, "").slice(0, 10).toUpperCase();
}

export function proConfigured(): boolean {
  return !!secret();
}

export function issueCode(tag: string, days: number): { code: string; expires: string } | null {
  const key = secret();
  if (!key) return null;
  const cleanTag = tag.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "PRO";
  const exp = new Date(Date.now() + Math.max(1, Math.min(3660, days)) * 86_400_000);
  const ymd = exp.toISOString().slice(0, 10).replace(/-/g, "");
  const payload = `${cleanTag}.${ymd}`;
  return { code: `RI-${cleanTag}-${ymd}-${sign(payload, key)}`, expires: exp.toISOString().slice(0, 10) };
}

export function verifyCode(code: string): { ok: true; expires: string; tag: string } | { ok: false; reason: string } {
  const key = secret();
  if (!key) return { ok: false, reason: "not-configured" };
  const m = code.trim().toUpperCase().match(/^RI-([A-Z0-9]{1,8})-(\d{8})-([A-Z0-9]{6,12})$/);
  if (!m) return { ok: false, reason: "invalid" };
  const [, tag, ymd, sig] = m;
  const expected = sign(`${tag}.${ymd}`, key);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "invalid" };
  const expires = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
  if (new Date(`${expires}T23:59:59Z`).getTime() < Date.now()) return { ok: false, reason: "expired" };
  return { ok: true, expires, tag };
}

export function checkAdmin(password: unknown): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof password !== "string" || password.length === 0) return false;
  const a = Buffer.from(createHmac("sha256", "cmp").update(password).digest());
  const b = Buffer.from(createHmac("sha256", "cmp").update(real).digest());
  return timingSafeEqual(a, b);
}
