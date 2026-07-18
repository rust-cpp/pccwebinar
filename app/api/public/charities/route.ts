import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/mongodb";
import { consumeRateLimit, requestIdentity } from "@/lib/security";
import { Registration } from "@/models/Registration";

export const dynamic = "force-dynamic";
const querySchema = z.object({ q: z.string().trim().max(80).default(""), page: z.coerce.number().int().min(1).max(10000).default(1) });
const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({ q: request.nextUrl.searchParams.get("q") || "", page: request.nextUrl.searchParams.get("page") || "1" });
  if (!parsed.success) return NextResponse.json({ error: "Invalid directory query." }, { status: 400 });
  await getDatabase();
  const identity = requestIdentity(await headers());
  const rate = await consumeRateLimit("public-directory", identity.ipHash, 120, 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const escaped = parsed.data.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = { ngoName: { $type: "string", $ne: "", ...(escaped ? { $regex: escaped, $options: "i" } : {}) } };
  const [result] = await Registration.aggregate<{ items: { name: string }[]; meta: { total: number }[] }>([
    { $match: match }, { $sort: { createdAt: -1 } },
    { $group: { _id: { $toLower: "$ngoName" }, name: { $first: "$ngoName" }, latest: { $first: "$createdAt" } } },
    { $sort: { name: 1 } },
    { $facet: { items: [{ $skip: (parsed.data.page - 1) * PAGE_SIZE }, { $limit: PAGE_SIZE }, { $project: { _id: 0, name: 1 } }], meta: [{ $count: "total" }] } },
  ]);
  const total = result?.meta[0]?.total || 0;
  return NextResponse.json({ names: (result?.items || []).map(item => item.name), page: parsed.data.page, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
