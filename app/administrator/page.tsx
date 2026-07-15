import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, CalendarDays, Download, Pencil, Plus, Search, UserCheck, Users } from "lucide-react";
import { AdministratorHeader } from "@/components/administrator-header";
import { RegistrationRecordsTable } from "@/components/registration-records-table";
import { isAdmin } from "@/lib/auth";
import { defaultFormFields, type WebinarFormField } from "@/lib/form-types";
import { getDatabase } from "@/lib/mongodb";
import { currentWebinar } from "@/lib/webinar";
import { ensureRegistrationIndexes, Registration } from "@/models/Registration";
import { Webinar } from "@/models/Webinar";

export const dynamic = "force-dynamic";
type WebinarRecord = { _id: unknown; slug: string; title: string; status: string; date: string | Date; formFields?: WebinarFormField[] };
type RegistrationRecord = Record<string, unknown> & { _id: unknown; attended?: boolean; pccRegistered?: boolean; answers?: Record<string, unknown> };

export default async function AdministratorPage({ searchParams }: { searchParams: Promise<{ q?: string; webinar?: string }> }) {
  if (!(await isAdmin())) redirect("/administrator/login");
  const requested = await searchParams;
  let webinars: WebinarRecord[] = []; let registrations: RegistrationRecord[] = []; let dbError = "";
  try {
    await getDatabase();
    await ensureRegistrationIndexes();
    const legacy = await Webinar.findOne({ slug: currentWebinar.slug }).lean();
    if (!legacy) await Webinar.create({ ...currentWebinar, formFields: defaultFormFields, whatsappChannel: "https://whatsapp.com/channel/0029Vb7jNfsFSAswgqgwBp3R", confirmationMessage: "Your registration is confirmed.", closedMessage: "Thank you for your interest. See you in the next webinar." });
    else if (!legacy.formFields?.length) await Webinar.updateOne({ _id: legacy._id }, { $set: { formFields: defaultFormFields, eyebrow: currentWebinar.eyebrow, heroTitle: currentWebinar.heroTitle, heroAccent: currentWebinar.heroAccent } });
    webinars = JSON.parse(JSON.stringify(await Webinar.find().sort({ date: -1 }).lean())) as WebinarRecord[];
    const slug = requested.webinar || webinars[0]?.slug || currentWebinar.slug;
    const selected = webinars.find(item => item.slug === slug);
    const fields = (selected?.formFields?.length ? selected.formFields : defaultFormFields) as WebinarFormField[];
    const filter: Record<string, unknown> = { webinarSlug: slug };
    if (requested.q) filter.$or = [...new Set(["fullName", "ngoName", "contactNumber", "email", ...fields.map(field => `answers.${field.key}`)])].map(field => ({ [field]: { $regex: requested.q, $options: "i" } }));
    registrations = JSON.parse(JSON.stringify(await Registration.find(filter).sort({ createdAt: -1 }).lean())) as RegistrationRecord[];
  } catch { dbError = "Registration data is temporarily unavailable. Check the database connection."; }

  const webinarSlug = requested.webinar || webinars[0]?.slug || currentWebinar.slug;
  const selectedWebinar = webinars.find(item => item.slug === webinarSlug);
  const selectedFields = (selectedWebinar?.formFields?.length ? selectedWebinar.formFields : defaultFormFields) as WebinarFormField[];
  const attended = registrations.filter(record => record.attended).length;
  const pccField = selectedFields.find(field => field.key === "pccRegistered");
  const registered = registrations.filter(record => record.pccRegistered || (pccField && /^yes/i.test(String(record.answers?.pccRegistered || "")))).length;

  return <main className="min-h-screen bg-[#f4f0e6] text-[#12231a]"><AdministratorHeader/><div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
    <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#4c6757]">Management overview</p><h1 className="mt-3 text-5xl font-bold tracking-[-.055em]">Webinar records</h1><p className="mt-3 text-base text-[#526158]">Open any past or upcoming webinar to review its form, participants, and attendance.</p></div><Link href="/administrator/webinars/new" className="flex items-center justify-center gap-2 rounded-md bg-[#123d29] px-5 py-3.5 text-sm font-bold text-white"><Plus className="h-4 w-4"/>Create webinar</Link></div>
    {dbError && <div className="mt-7 border border-amber-700/25 bg-amber-50 p-4 text-sm text-amber-900">{dbError}</div>}
    <div className="mt-10 grid border-y border-[#173c29]/20 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={Users} label="Registrations" value={registrations.length}/><Stat icon={UserCheck} label="Attended" value={attended}/><Stat icon={Building2} label="PCC registered" value={registered}/><Stat icon={CalendarDays} label="All webinars" value={webinars.length}/></div>
    <section className="mt-10 border border-[#173c29]/20 bg-[#fffdf7]"><div className="border-b border-[#173c29]/15 p-5"><div className="flex flex-wrap gap-2">{webinars.map(webinar => <div key={String(webinar._id)} className={`flex items-center rounded-md border ${webinarSlug === webinar.slug ? "border-[#123d29] bg-[#123d29] text-white" : "border-[#173c29]/20 text-[#526158]"}`}><Link href={`/administrator?webinar=${webinar.slug}`} className="px-3 py-2 text-xs font-semibold">{webinar.title}<span className="ml-2 opacity-60">{webinar.status}</span></Link><Link href={`/administrator/webinars/${webinar._id}`} aria-label={`Edit ${webinar.title}`} className="border-l border-current/20 p-2"><Pencil className="h-3.5 w-3.5"/></Link></div>)}</div></div>
      <div className="flex flex-col gap-4 border-b border-[#173c29]/15 p-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-2xl font-bold tracking-[-.035em]">{selectedWebinar?.title || "Webinar registrations"}</h2><p className="mt-1 text-sm text-[#526158]">{selectedWebinar ? new Date(selectedWebinar.date).toLocaleString("en-PK") : ""} · {selectedFields.length} form fields</p></div><div className="flex gap-2"><form className="relative"><input type="hidden" name="webinar" value={webinarSlug}/><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526158]"/><input name="q" defaultValue={requested.q || ""} placeholder="Search any response..." className="w-full rounded-md border border-[#173c29]/20 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#173c29] sm:w-64"/></form><Link href={`/administrator/export?webinar=${webinarSlug}`} className="flex shrink-0 items-center gap-2 rounded-md border border-[#173c29]/30 px-3 text-xs font-semibold text-[#123d29]"><Download className="h-4 w-4"/>Excel</Link></div></div>
      <RegistrationRecordsTable records={JSON.parse(JSON.stringify(registrations))} fields={JSON.parse(JSON.stringify(selectedFields))}/>
    </section>
  </div></main>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <div className="border-b border-[#173c29]/15 p-5 last:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0"><div className="flex items-center justify-between"><p className="text-sm font-medium text-[#526158]">{label}</p><Icon className="h-5 w-5 text-[#365b45]"/></div><p className="mt-5 text-4xl font-bold tracking-[-.04em]">{value.toLocaleString()}</p></div>; }
