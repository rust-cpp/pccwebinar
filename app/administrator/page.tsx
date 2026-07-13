import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Download, LogOut, Plus, Search, Users, UserCheck, Building2 } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { Webinar } from "@/models/Webinar";
import { currentWebinar } from "@/lib/webinar";
import { AttendanceToggle } from "@/components/attendance-toggle";
import { DeleteRegistration } from "@/components/delete-registration";
import { createWebinarAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdministratorPage({ searchParams }: { searchParams: Promise<{ q?: string; webinar?: string }> }) {
  if (!(await isAdmin())) redirect("/administrator/login");
  const { q = "", webinar = currentWebinar.slug } = await searchParams;
  let registrations: Record<string, any>[] = [];
  let webinars: Record<string, any>[] = [];
  let dbError = "";
  try {
    await getDatabase();
    await Webinar.updateOne({ slug: currentWebinar.slug }, { $set: currentWebinar }, { upsert: true });
    const filter: Record<string, any> = { webinarSlug: webinar };
    if (q) filter.$or = ["fullName", "ngoName", "contactNumber", "email"].map(field => ({ [field]: { $regex: q, $options: "i" } }));
    [webinars, registrations] = await Promise.all([
      Webinar.find().sort({ date: -1 }).lean(),
      Registration.find(filter).sort({ createdAt: -1 }).lean(),
    ]);
  } catch { dbError = "Registration data is temporarily unavailable. Check the database connection."; }

  const attended = registrations.filter(r => r.attended).length;
  const registered = registrations.filter(r => r.pccRegistered).length;

  return <main className="min-h-screen bg-[#f4f0e6] text-[#12231a]">
    <header className="border-b border-[#173c29]/20 bg-[#0b2419] text-[#f4f0e6]">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center bg-[#f4f0e6] p-2"><Image src="/pcc-logo.svg" alt="PCC" width={44} height={44} className="h-full w-full object-contain"/></div><div><p className="text-sm font-semibold">Punjab Charities Commission</p><p className="mt-1 text-[10px] uppercase tracking-[.2em] text-[#b7cbbd]">Webinar administration</p></div></div>
        <Link prefetch={false} href="/administrator/logout" className="flex items-center gap-2 border-b border-white/30 pb-1 text-xs text-white/65 transition hover:border-white hover:text-white"><LogOut className="h-3.5 w-3.5"/>Sign out</Link>
      </div>
    </header>

    <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#4c6757]">Management overview</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Webinar records</h1><p className="mt-3 text-sm text-[#526158]">Sessions, confirmed participants, and attendance in one place.</p></div>
        <details className="group relative"><summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-sm bg-[#123d29] px-5 py-3.5 text-sm font-bold text-white"><Plus className="h-4 w-4"/>New webinar</summary><form action={createWebinarAction} className="absolute right-0 z-30 mt-2 grid w-[min(430px,calc(100vw-40px))] gap-3 border border-[#173c29]/20 bg-[#fffdf7] p-5 shadow-[0_20px_60px_rgba(18,35,26,.18)]"><input name="title" required placeholder="Webinar title" className="rounded-sm border border-[#173c29]/25 bg-transparent p-3 outline-none focus:border-[#173c29]"/><div className="grid grid-cols-2 gap-3"><input name="date" required type="datetime-local" className="rounded-sm border border-[#173c29]/25 bg-transparent p-3 text-sm outline-none"/><input name="capacity" type="number" defaultValue="250" className="rounded-sm border border-[#173c29]/25 bg-transparent p-3 outline-none"/></div><input name="venue" defaultValue="Online webinar" className="rounded-sm border border-[#173c29]/25 bg-transparent p-3 outline-none"/><button className="rounded-sm bg-[#123d29] p-3 font-bold text-white">Create session</button></form></details>
      </div>

      {dbError && <div className="mt-7 border border-amber-700/25 bg-amber-50 p-4 text-sm text-amber-900">{dbError}</div>}

      <div className="mt-10 grid border-y border-[#173c29]/20 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Confirmed seats" value={registrations.length}/><Stat icon={UserCheck} label="Attended" value={attended}/><Stat icon={Building2} label="PCC registered" value={registered}/><Stat icon={CalendarDays} label="Total webinars" value={webinars.length}/>
      </div>

      <section className="mt-10 border border-[#173c29]/20 bg-[#fffdf7]">
        <div className="flex flex-col gap-5 border-b border-[#173c29]/15 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">{webinars.map(w => <Link key={String(w._id)} href={`/administrator?webinar=${w.slug}`} className={`rounded-sm border px-3 py-2 text-xs font-medium ${webinar === w.slug ? "border-[#123d29] bg-[#123d29] text-white" : "border-[#173c29]/20 text-[#526158] hover:border-[#173c29]/50"}`}>{w.title}</Link>)}</div>
          <div className="flex gap-2"><form className="relative"><input type="hidden" name="webinar" value={webinar}/><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526158]"/><input name="q" defaultValue={q} placeholder="Search name, NGO, email..." className="w-full rounded-sm border border-[#173c29]/20 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#173c29] sm:w-64"/></form><Link href={`/administrator/export?webinar=${webinar}`} className="flex shrink-0 items-center gap-2 rounded-sm border border-[#173c29]/30 px-3 text-xs font-semibold text-[#123d29] hover:bg-[#e8e8dc]"><Download className="h-4 w-4"/>Excel</Link></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1160px] text-left text-sm"><thead className="border-b border-[#173c29]/15 bg-[#edf0e6] text-[10px] uppercase tracking-[.12em] text-[#526158]"><tr><th className="p-4">Participant</th><th className="p-4">Organization</th><th className="p-4">NGO type</th><th className="p-4">Contact</th><th className="p-4">PCC status</th><th className="p-4">Registered</th><th className="p-4">Attendance</th><th className="p-4 text-center">Actions</th></tr></thead><tbody className="divide-y divide-[#173c29]/10">{registrations.map(r => <tr key={String(r._id)} className="transition hover:bg-[#f3f4ed]"><td className="p-4 font-semibold">{r.fullName}</td><td className="p-4 text-[#526158]">{r.ngoName}</td><td className="p-4 text-xs text-[#526158]">{r.ngoType || "—"}</td><td className="p-4"><p className="font-mono text-xs">{r.contactNumber}</p><p className="mt-1 text-xs text-[#526158]">{r.email || "—"}</p></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs ${r.pccRegistered ? "bg-[#dce8d9] text-[#1f583a]" : "bg-[#e8e8dc] text-[#526158]"}`}>{r.pccRegistered ? "Registered" : "Non-registered"}</span></td><td className="p-4 text-xs text-[#526158]">{new Date(r.createdAt).toLocaleDateString("en-PK")}</td><td className="p-4"><AttendanceToggle id={String(r._id)} attended={r.attended}/></td><td className="p-4"><div className="flex justify-center"><DeleteRegistration id={String(r._id)} participant={r.fullName}/></div></td></tr>)}{!registrations.length && <tr><td colSpan={8} className="p-16 text-center text-[#526158]">No registrations found for this webinar.</td></tr>}</tbody></table></div>
      </section>
    </div>
  </main>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <div className="border-b border-[#173c29]/15 p-5 last:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0"><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#526158]">{label}</p><Icon className="h-4 w-4 text-[#365b45]"/></div><p className="mt-5 text-4xl font-semibold tracking-[-.04em]">{value.toLocaleString()}</p></div>}
