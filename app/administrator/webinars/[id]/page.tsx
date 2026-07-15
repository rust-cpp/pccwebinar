import { notFound, redirect } from "next/navigation";
import { AdministratorHeader } from "@/components/administrator-header";
import { WebinarBuilder } from "@/components/webinar-builder";
import { isAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { serializeWebinar } from "@/lib/webinar-data";
import { Webinar } from "@/models/Webinar";

export const dynamic = "force-dynamic";
export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/administrator/login");
  const { id } = await params; if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  await getDatabase(); const webinar = await Webinar.findById(id).lean(); if (!webinar) notFound();
  const initial = serializeWebinar(JSON.parse(JSON.stringify(webinar)));
  const pakistan = new Date(new Date(initial.date).getTime() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
  return <main className="min-h-screen bg-[#f4f0e6] text-[#12231a]"><AdministratorHeader/><div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#526158]">Edit webinar</p><h1 className="mt-3 text-5xl font-bold tracking-[-.055em]">Webinar builder</h1><p className="mt-3 text-base text-[#526158]">Changes affect the public page and future registrations immediately after saving.</p><div className="mt-9"><WebinarBuilder initial={{ ...initial, date: pakistan }}/></div></div></main>;
}
