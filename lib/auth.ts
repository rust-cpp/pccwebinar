import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "pcc_admin";
function token() { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "local-pcc-secret").update("pcc-admin-session").digest("hex"); }
export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const expected = token();
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
export async function createAdminSession() { (await cookies()).set(COOKIE, token(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" }); }
export async function clearAdminSession() { (await cookies()).delete(COOKIE); }
