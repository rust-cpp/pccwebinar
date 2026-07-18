import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { RateLimit } from "@/models/RateLimit";
import { SecurityEvent } from "@/models/SecurityEvent";

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is required for registration security.");
  return value;
}

function hash(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }

export function issueRegistrationToken(slug: string) {
  const payload = Buffer.from(JSON.stringify({ slug, issuedAt: Date.now(), nonce: randomBytes(12).toString("hex") })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyRegistrationToken(token: string, slug: string) {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return { valid: false, reason: "Malformed form token." };
    const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return { valid: false, reason: "Invalid form token signature." };
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { slug: string; issuedAt: number };
    const age = Date.now() - data.issuedAt;
    if (data.slug !== slug || age < 1500 || age > 24 * 60 * 60 * 1000) return { valid: false, reason: age < 1500 ? "Form submitted too quickly." : "Form token expired." };
    return { valid: true, reason: "" };
  } catch { return { valid: false, reason: "Unreadable form token." }; }
}

export function requestIdentity(requestHeaders: Headers) {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  const userAgent = requestHeaders.get("user-agent") || "unknown";
  return { ipHash: hash(`ip:${ip}`), userAgentHash: hash(`ua:${userAgent}`) };
}

export function isSameOrigin(requestHeaders: Headers) {
  const fetchSite = requestHeaders.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) return false;
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function consumeRateLimit(scope: string, identifier: string, limit: number, windowMs: number) {
  const bucket = Math.floor(Date.now() / windowMs);
  const id = createHash("sha256").update(`${scope}:${identifier}:${bucket}`).digest("hex");
  const document = await RateLimit.findOneAndUpdate({ _id: id }, { $inc: { count: 1 }, $setOnInsert: { scope, expiresAt: new Date((bucket + 2) * windowMs) } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
  return { allowed: Boolean(document && document.count <= limit), count: document?.count || 0 };
}

export async function logSecurityEvent(input: { type: "rate_limited" | "invalid_token" | "invalid_login" | "honeypot" | "origin_mismatch" | "validation_failed" | "duplicate" | "bulk_deleted"; webinarSlug?: string; occurrenceKey?: string; ipHash?: string; detail?: string; count?: number }) {
  try { await SecurityEvent.create(input); } catch { /* security logging must not crash the public request */ }
}
