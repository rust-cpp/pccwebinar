import { redirect } from "next/navigation";
import { Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdministratorHeader } from "@/components/administrator-header";
import { BulkDeleteTool } from "@/components/bulk-delete-tool";
import { isAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { SecurityEvent } from "@/models/SecurityEvent";
import { Webinar } from "@/models/Webinar";

export const dynamic = "force-dynamic";
function pakistanInput(date: Date) { return new Date(date.getTime() + 5 * 3600000).toISOString().slice(0, 16); }

export default async function SecurityPage() {
  if (!(await isAdmin())) redirect("/administrator/login");
  await getDatabase();
  const now = new Date(); const dayAgo = new Date(now.getTime() - 24 * 3600000); const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const [events, buckets, webinars, blocked] = await Promise.all([
    SecurityEvent.find({ createdAt: { $gte: weekAgo } }).sort({ createdAt: -1 }).limit(100).lean(),
    Registration.aggregate<{ _id: Date; count: number; sources: number }>([{ $match: { createdAt: { $gte: dayAgo } } }, { $group: { _id: { $dateTrunc: { date: "$createdAt", unit: "minute", binSize: 15 } }, count: { $sum: 1 }, sources: { $addToSet: "$ipHash" } } }, { $project: { count: 1, sources: { $size: "$sources" } } }, { $sort: { _id: -1 } }]),
    Webinar.find({}, { slug: 1, title: 1 }).sort({ date: -1 }).lean(),
    SecurityEvent.countDocuments({ type: { $in: ["rate_limited", "invalid_token", "invalid_login", "honeypot", "origin_mismatch"] }, createdAt: { $gte: dayAgo } }),
  ]);
  return <main className="min-h-screen bg-[#f4f0e6] text-[#12231a]"><AdministratorHeader/><div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#526158]">Abuse protection</p><h1 className="mt-3 text-5xl font-bold tracking-[-.055em]">Security activity</h1><p className="mt-4 max-w-3xl text-base leading-7 text-[#526158]">Inspect registration bursts, blocked automation, and exact attack windows before removing malicious records.</p><div className="mt-9 grid gap-4 sm:grid-cols-3"><Metric icon={Activity} label="Registrations · 24h" value={buckets.reduce((sum, bucket) => sum + bucket.count, 0)}/><Metric icon={ShieldAlert} label="Blocked requests · 24h" value={blocked}/><Metric icon={ShieldCheck} label="Protection status" value="Active"/></div>
    <section className="mt-8 border border-[#173c29]/20 bg-[#fffdf7]"><div className="border-b border-[#173c29]/15 p-5"><h2 className="text-2xl font-bold">15-minute registration timeline</h2><p className="mt-1 text-sm text-[#607066]">A sudden high count from very few source hashes can indicate automated abuse.</p></div><div className="grid max-h-80 gap-px overflow-y-auto bg-[#173c29]/10 sm:grid-cols-2 lg:grid-cols-4">{buckets.map(bucket => <div key={String(bucket._id)} className="bg-[#fffdf7] p-4"><p className="text-xs text-[#607066]">{new Date(bucket._id).toLocaleString("en-PK")}</p><p className="mt-2 text-3xl font-bold">{bucket.count}</p><p className="text-xs text-[#607066]">{bucket.sources} source hash{bucket.sources === 1 ? "" : "es"}</p></div>)}{!buckets.length && <p className="bg-[#fffdf7] p-8 text-sm text-[#607066]">No registrations in the last 24 hours.</p>}</div></section>
    <section className="mt-8"><BulkDeleteTool webinars={webinars.map(webinar => ({ slug: webinar.slug, title: webinar.title }))} defaults={{ from: pakistanInput(new Date(now.getTime() - 15 * 60000)), to: pakistanInput(now) }}/></section>
    <section className="mt-8 border border-[#173c29]/20 bg-[#fffdf7]"><div className="border-b border-[#173c29]/15 p-5"><h2 className="text-2xl font-bold">Security event log</h2><p className="mt-1 text-sm text-[#607066]">Hashed identifiers help correlate attacks without storing or displaying raw IP addresses.</p></div><div className="divide-y divide-[#173c29]/10">{events.map(event => <div key={String(event._id)} className="grid gap-2 p-4 text-sm sm:grid-cols-[180px_150px_1fr]"><span className="text-[#607066]">{new Date(event.createdAt).toLocaleString("en-PK")}</span><span className="font-bold text-[#8b2f28]">{event.type.replaceAll("_", " ")}</span><span className="text-[#405247]">{event.detail || "—"}{event.count > 1 ? ` · ${event.count} records` : ""}</span></div>)}{!events.length && <p className="p-8 text-sm text-[#607066]">No security events recorded in the last seven days.</p>}</div></section>
  </div></main>;
}
function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number | string }) { return <div className="border border-[#173c29]/20 bg-[#fffdf7] p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#607066]">{label}</p><Icon className="h-5 w-5 text-[#365b45]"/></div><p className="mt-5 text-4xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p></div>; }
