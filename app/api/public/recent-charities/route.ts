import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { consumeRateLimit, requestIdentity } from "@/lib/security";
import { Registration } from "@/models/Registration";

export const dynamic = "force-dynamic";

export async function GET() {
  await getDatabase();
  const identity = requestIdentity(await headers());
  const rate = await consumeRateLimit("public-recent", identity.ipHash, 120, 60 * 1000);
  if (!rate.allowed) return NextResponse.json({ names: [] }, { status: 429 });
  const rows = await Registration.aggregate<{ name: string }>([
    { $match: { ngoName: { $type: "string", $ne: "" } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: { $toLower: "$ngoName" }, name: { $first: "$ngoName" }, latest: { $first: "$createdAt" } } },
    { $sort: { latest: -1 } },
    { $limit: 14 },
    { $project: { _id: 0, name: 1 } },
  ]);
  return NextResponse.json({ names: rows.map(row => row.name) }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
