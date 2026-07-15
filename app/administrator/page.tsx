import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, Building2, CalendarDays, ChevronLeft, ChevronRight, Download, FileEdit, Pencil, Plus, Radio, Search, UserCheck, Users } from "lucide-react";
import { z } from "zod";
import { AdministratorHeader } from "@/components/administrator-header";
import { RegistrationRecordsTable } from "@/components/registration-records-table";
import { isAdmin } from "@/lib/auth";
import { defaultFormFields, type WebinarFormField } from "@/lib/form-types";
import { getDatabase } from "@/lib/mongodb";
import { currentWebinar } from "@/lib/webinar";
import { ensureRegistrationIndexes, Registration } from "@/models/Registration";
import { Webinar } from "@/models/Webinar";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;
type WebinarRecord = { _id: unknown; slug: string; title: string; status: "draft" | "open" | "closed" | "completed"; date: string | Date; formFields?: WebinarFormField[] };
type RegistrationRecord = Record<string, unknown> & { _id: unknown; attended?: boolean; pccRegistered?: boolean; answers?: Record<string, unknown> };

export default async function AdministratorPage({ searchParams }: { searchParams: Promise<{ q?: string; webinar?: string; page?: string }> }) {
  if (!(await isAdmin())) redirect("/administrator/login");
  const requested = await searchParams;
  const parsedPage = z.coerce.number().int().min(1).safeParse(requested.page || "1");
  let page = parsedPage.success ? parsedPage.data : 1;
  let webinars: WebinarRecord[] = []; let registrations: RegistrationRecord[] = []; let dbError = "";
  let totalRegistrations = 0; let attended = 0; let registered = 0; let filteredCount = 0;

  try {
    await getDatabase(); await ensureRegistrationIndexes();
    const legacy = await Webinar.findOne({ slug: currentWebinar.slug }).lean();
    if (!legacy) await Webinar.create({ ...currentWebinar, formFields: defaultFormFields, whatsappChannel: "https://whatsapp.com/channel/0029Vb7jNfsFSAswgqgwBp3R", confirmationMessage: "Your registration is confirmed.", closedMessage: "Thank you for your interest. See you in the next webinar." });
    else if (!legacy.formFields?.length) await Webinar.updateOne({ _id: legacy._id }, { $set: { formFields: defaultFormFields, eyebrow: currentWebinar.eyebrow, heroTitle: currentWebinar.heroTitle, heroAccent: currentWebinar.heroAccent } });
    webinars = JSON.parse(JSON.stringify(await Webinar.find().sort({ date: -1 }).lean())) as WebinarRecord[];
    const live = webinars.filter(item => item.status === "open");
    const fallback = live[0] || webinars.find(item => ["closed", "completed"].includes(item.status)) || webinars[0];
    const selected = webinars.find(item => item.slug === requested.webinar) || fallback;
    if (selected) {
      const fields = (selected.formFields?.length ? selected.formFields : defaultFormFields) as WebinarFormField[];
      const baseFilter = { webinarSlug: selected.slug };
      const filter: Record<string, unknown> = { ...baseFilter };
      if (requested.q) filter.$or = [...new Set(["fullName", "ngoName", "contactNumber", "email", ...fields.map(field => `answers.${field.key}`)])].map(field => ({ [field]: { $regex: requested.q, $options: "i" } }));
      [filteredCount, totalRegistrations, attended, registered] = await Promise.all([
        Registration.countDocuments(filter), Registration.countDocuments(baseFilter), Registration.countDocuments({ ...baseFilter, attended: true }), Registration.countDocuments({ ...baseFilter, $or: [{ pccRegistered: true }, { "answers.pccRegistered": { $regex: "^yes", $options: "i" } }] }),
      ]);
      const pages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE)); page = Math.min(page, pages);
      registrations = JSON.parse(JSON.stringify(await Registration.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean())) as RegistrationRecord[];
    }
  } catch { dbError = "Registration data is temporarily unavailable. Check the database connection."; }

  const liveWebinars = webinars.filter(item => item.status === "open");
  const drafts = webinars.filter(item => item.status === "draft");
  const archived = webinars.filter(item => item.status === "closed" || item.status === "completed");
  const fallback = liveWebinars[0] || archived[0] || drafts[0];
  const selectedWebinar = webinars.find(item => item.slug === requested.webinar) || fallback;
  const webinarSlug = selectedWebinar?.slug || "";
  const selectedFields = (selectedWebinar?.formFields?.length ? selectedWebinar.formFields : defaultFormFields) as WebinarFormField[];
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  return <main className="min-h-screen bg-[#f4f0e6] text-[#12231a]"><AdministratorHeader/><div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
    <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#4c6757]">Management overview</p><h1 className="mt-3 text-5xl font-bold tracking-[-.055em]">Webinar directory</h1><p className="mt-3 text-base text-[#526158]">Live webinars stay prominent. Closed and completed sessions move into the archive with their complete records.</p></div><Link href="/administrator/webinars/new" className="flex items-center justify-center gap-2 rounded-md bg-[#123d29] px-5 py-3.5 text-sm font-bold text-white"><Plus className="h-4 w-4"/>Create webinar</Link></div>
    {dbError && <div className="mt-7 border border-amber-700/25 bg-amber-50 p-4 text-sm text-amber-900">{dbError}</div>}
    <section className="mt-10 grid gap-5 lg:grid-cols-3"><DirectoryGroup title="Live webinars" icon={Radio} items={liveWebinars} selected={webinarSlug} empty="No webinar is currently live."/><DirectoryGroup title="Drafts" icon={FileEdit} items={drafts} selected={webinarSlug} empty="No draft webinars."/><DirectoryGroup title="Archived webinars" icon={Archive} items={archived} selected={webinarSlug} empty="No archived webinars."/></section>
    <div className="mt-10 grid border-y border-[#173c29]/20 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Users} label="Registrations" value={totalRegistrations}/><Stat icon={UserCheck} label="Attended" value={attended}/><Stat icon={Building2} label="PCC registered" value={registered}/><Stat icon={CalendarDays} label="Archived webinars" value={archived.length}/></div>
    {selectedWebinar ? <section className="mt-10 border border-[#173c29]/20 bg-[#fffdf7]"><div className="flex flex-col gap-4 border-b border-[#173c29]/15 p-5 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-3"><h2 className="text-2xl font-bold tracking-[-.035em]">{selectedWebinar.title}</h2><span className="rounded-full bg-[#e3e7dd] px-2.5 py-1 text-xs font-semibold text-[#526158]">{selectedWebinar.status}</span></div><p className="mt-2 text-sm text-[#526158]">{new Date(selectedWebinar.date).toLocaleString("en-PK")} · {selectedFields.length} form fields · {filteredCount} matching records</p></div><div className="flex gap-2"><form className="relative"><input type="hidden" name="webinar" value={webinarSlug}/><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526158]"/><input name="q" defaultValue={requested.q || ""} placeholder="Search any response..." className="w-full rounded-md border border-[#173c29]/20 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#173c29] sm:w-64"/></form><Link href={`/administrator/export?webinar=${webinarSlug}`} className="flex shrink-0 items-center gap-2 rounded-md border border-[#173c29]/30 px-3 text-xs font-semibold text-[#123d29]"><Download className="h-4 w-4"/>Excel</Link></div></div>
      <RegistrationRecordsTable records={JSON.parse(JSON.stringify(registrations))} fields={JSON.parse(JSON.stringify(selectedFields))}/>
      <Pagination page={page} totalPages={totalPages} webinar={webinarSlug} query={requested.q || ""} count={filteredCount}/>
    </section> : <div className="mt-10 border border-dashed border-[#173c29]/30 p-14 text-center text-[#526158]">Create your first webinar to begin collecting registrations.</div>}
  </div></main>;
}

function DirectoryGroup({ title, icon: Icon, items, selected, empty }: { title: string; icon: typeof Radio; items: WebinarRecord[]; selected: string; empty: string }) { return <div className="border border-[#173c29]/20 bg-[#fffdf7]"><div className="flex items-center gap-2 border-b border-[#173c29]/15 bg-[#edf0e6] px-4 py-3"><Icon className="h-4 w-4 text-[#365b45]"/><h2 className="text-sm font-bold">{title}</h2><span className="ml-auto text-xs text-[#607066]">{items.length}</span></div><div className="max-h-64 overflow-y-auto p-2">{items.map(item => <div key={String(item._id)} className={`mb-1 flex items-center rounded-md border last:mb-0 ${selected === item.slug ? "border-[#123d29] bg-[#123d29] text-white" : "border-transparent hover:bg-[#edf0e6]"}`}><Link href={`/administrator?webinar=${item.slug}`} className="min-w-0 flex-1 px-3 py-2.5"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs opacity-65">{new Date(item.date).toLocaleDateString("en-PK")}</span></Link><Link href={`/administrator/webinars/${item._id}`} aria-label={`Edit ${item.title}`} className="p-3"><Pencil className="h-4 w-4"/></Link></div>)}{!items.length && <p className="p-5 text-center text-sm text-[#718078]">{empty}</p>}</div></div>; }
function Pagination({ page, totalPages, webinar, query, count }: { page: number; totalPages: number; webinar: string; query: string; count: number }) { if (totalPages <= 1) return <div className="border-t border-[#173c29]/15 px-5 py-4 text-sm text-[#607066]">{count} record{count === 1 ? "" : "s"}</div>; const href = (target: number) => `/administrator?${new URLSearchParams({ webinar, ...(query ? { q: query } : {}), page: String(target) })}`; return <div className="flex flex-col items-center justify-between gap-3 border-t border-[#173c29]/15 px-5 py-4 sm:flex-row"><p className="text-sm text-[#607066]">Page {page} of {totalPages} · {count} records</p><div className="flex items-center gap-2"><Link aria-disabled={page === 1} href={page === 1 ? href(1) : href(page - 1)} className={`flex items-center gap-1 rounded-md border border-[#173c29]/20 px-3 py-2 text-sm font-semibold ${page === 1 ? "pointer-events-none opacity-35" : "hover:bg-[#edf0e6]"}`}><ChevronLeft className="h-4 w-4"/>Previous</Link><Link aria-disabled={page === totalPages} href={page === totalPages ? href(totalPages) : href(page + 1)} className={`flex items-center gap-1 rounded-md border border-[#173c29]/20 px-3 py-2 text-sm font-semibold ${page === totalPages ? "pointer-events-none opacity-35" : "hover:bg-[#edf0e6]"}`}>Next<ChevronRight className="h-4 w-4"/></Link></div></div>; }
function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <div className="border-b border-[#173c29]/15 p-5 last:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0"><div className="flex items-center justify-between"><p className="text-sm font-medium text-[#526158]">{label}</p><Icon className="h-5 w-5 text-[#365b45]"/></div><p className="mt-5 text-4xl font-bold tracking-[-.04em]">{value.toLocaleString()}</p></div>; }
