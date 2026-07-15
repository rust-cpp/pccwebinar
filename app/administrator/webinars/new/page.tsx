import { redirect } from "next/navigation";
import { AdministratorHeader } from "@/components/administrator-header";
import { WebinarBuilder } from "@/components/webinar-builder";
import { isAdmin } from "@/lib/auth";
import { defaultFormFields, type WebinarConfig } from "@/lib/form-types";

function createDefaultDate() { const date = new Date(); date.setDate(date.getDate() + 7); date.setHours(11, 0, 0, 0); return date; }

export default async function NewWebinarPage() {
  if (!(await isAdmin())) redirect("/administrator/login");
  const date = createDefaultDate();
  const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T11:00`;
  const initial: WebinarConfig = { title: "New NGO Training Webinar", slug: `ngo-webinar-${localDate.slice(0, 10)}`, eyebrow: "NGO Training Programme", heroTitle: "Build stronger.", heroAccent: "Serve better.", description: "Add a clear description of this webinar and what participants will learn.", date: localDate, venue: "Online webinar", capacity: 250, status: "draft", whatsappChannel: "https://whatsapp.com/channel/0029Vb7jNfsFSAswgqgwBp3R", confirmationMessage: "Your registration is confirmed. We look forward to welcoming you.", closedMessage: "Thank you for your interest. See you in the next webinar.", formFields: defaultFormFields.map(field => ({ ...field, options: field.options ? [...field.options] : [] })) };
  return <main className="min-h-screen bg-[#f4f0e6] text-[#12231a]"><AdministratorHeader/><div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#526158]">Create webinar</p><h1 className="mt-3 text-5xl font-bold tracking-[-.055em]">Webinar builder</h1><p className="mt-3 max-w-2xl text-base leading-7 text-[#526158]">Design the public page and build its registration form without changing code.</p><div className="mt-9"><WebinarBuilder initial={initial}/></div></div></main>;
}
