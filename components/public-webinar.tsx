import Image from "next/image";
import { CalendarDays, Clock3, Globe2 } from "lucide-react";
import { DynamicRegistrationForm } from "@/components/dynamic-registration-form";
import type { WebinarConfig } from "@/lib/form-types";
import { LiveRegistrationFeed } from "@/components/live-registration-feed";

export function PublicWebinar({ webinar, formToken }: { webinar: WebinarConfig; formToken: string }) {
  const date = new Date(webinar.date);
  const dateLabel = new Intl.DateTimeFormat("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Karachi" }).format(date);
  const closed = webinar.status !== "open";
  return <main className="min-h-[100dvh] bg-[#0b2419] text-[#f4f0e6] xl:h-[100dvh] xl:overflow-hidden">
    <section className="mx-auto min-h-[100dvh] max-w-[1600px] xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[1.02fr_.98fr]">
      <div className="event-panel px-4 py-5 sm:px-7 sm:py-7 xl:h-full xl:overflow-hidden xl:px-14 xl:py-8 2xl:px-20 2xl:py-10">
        <div>
          <div className="brand-block mb-2 flex items-center gap-3 sm:mb-4 xl:mb-7 xl:gap-5"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f4f0e6] p-2 sm:h-16 sm:w-16 xl:h-24 xl:w-24 xl:p-4"><Image src="/pcc-logo.svg" alt="Punjab Charities Commission" width={84} height={84} priority className="h-full w-full object-contain"/></div><div><p className="max-w-md text-lg font-bold leading-[.96] tracking-[-.035em] sm:text-2xl xl:text-4xl">Punjab Charities Commission</p><p className="mt-1 text-xs font-semibold text-[#b7cbbd] xl:mt-2 xl:text-base">Government of the Punjab</p></div></div>
          <div className="programme-label mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#b7cbbd] sm:text-xs xl:mb-3 xl:text-sm"><span className="h-0.5 w-6 bg-[#c9df72] xl:w-10"/>{webinar.eyebrow}</div>
          <h1 className="max-w-4xl text-[clamp(2rem,7vw,3.5rem)] font-semibold leading-[.9] tracking-[-.055em] xl:text-[clamp(3.6rem,6vw,6.5rem)]">{webinar.heroTitle} <span className="text-[#c9df72] xl:block">{webinar.heroAccent}</span></h1>
          <p className="event-intro mt-2 line-clamp-2 max-w-2xl text-xs leading-4 text-[#c7d1ca] sm:text-sm sm:leading-5 xl:mt-5 xl:text-xl xl:leading-8">{webinar.description}</p>
          <div className="event-details mt-2 grid max-w-2xl grid-cols-3 border-y border-white/15 xl:mt-5"><Info icon={CalendarDays} label="Next session" value={dateLabel}/><Info icon={Clock3} label="Time" value={`${timeLabel} — PKT`}/><Info icon={Globe2} label="Venue" value={webinar.venue}/></div>
        </div>
        <LiveRegistrationFeed/>
      </div>
      <aside className="bg-[#f4f0e6] px-4 py-7 text-[#12231a] sm:px-8 xl:h-full xl:overflow-y-auto xl:px-10 xl:py-7 2xl:px-14"><div className="registration-content mx-auto w-full max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#52675a]">Weekly registration</p><h2 className="mt-2 max-w-2xl text-3xl font-semibold leading-[.98] tracking-[-.05em] sm:text-4xl">Reserve your place this Thursday.</h2><p className="mt-2 max-w-2xl text-sm leading-5 text-[#526158]">The form stays open throughout the year. Each registration is assigned to the upcoming weekly session.</p>
        {webinar.whatsappChannel && <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border-2 border-[#1c6b43] bg-[#dcebdc] p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-5 w-5"/></div><div className="min-w-[180px] flex-1"><p className="text-sm font-bold text-[#123d29]">Follow the PCC WhatsApp Channel</p><p className="text-xs leading-4 text-[#365746]">Updates and the joining link are shared there.</p></div><a href={webinar.whatsappChannel} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-2 rounded-md bg-[#176b42] px-3 py-2 text-xs font-bold text-white"><WhatsAppIcon className="h-4 w-4"/>Follow now</a></div>}
        <div className="relative mt-3 border-t-2 border-[#173c29]/20 pt-3"><div className={closed ? "pointer-events-none select-none blur-[3px] opacity-30" : ""} aria-hidden={closed || undefined}><DynamicRegistrationForm slug={webinar.slug} fields={webinar.formFields} formToken={formToken} closed={closed}/></div>{closed && <div className="absolute inset-0 z-10 flex items-center justify-center px-4"><div className="w-full max-w-lg rounded-2xl border-2 border-[#173c29] bg-[#f4f0e6]/95 px-6 py-9 text-center shadow-xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#526158]">Registration update</p><h3 className="mt-3 text-4xl font-bold leading-[.95] tracking-[-.045em] text-[#123d29]">Registrations are closed.</h3><p className="mt-4 text-lg font-medium text-[#526158]">{webinar.closedMessage}</p></div></div>}</div>
      </div></aside>
    </section>
  </main>;
}

function WhatsAppIcon({ className }: { className?: string }) { return <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor"><path d="M16.01 3C8.84 3 3.02 8.82 3.02 15.99c0 2.28.59 4.51 1.71 6.47L3 29l6.7-1.76a12.96 12.96 0 0 0 6.3 1.61h.01C23.18 28.85 29 23.03 29 15.86 29 8.82 23.18 3 16.01 3Zm0 23.66h-.01a10.77 10.77 0 0 1-5.49-1.5l-.39-.23-3.98 1.05 1.06-3.88-.25-.4a10.77 10.77 0 1 1 9.06 4.96Zm5.91-8.07c-.32-.16-1.91-.94-2.21-1.05-.3-.11-.51-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.37-.5-2.6-1.61a9.73 9.73 0 0 1-1.8-2.24c-.19-.32-.02-.5.14-.66.15-.15.32-.38.49-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.57-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.14 1.11-1.14 2.7 0 1.59 1.16 3.13 1.32 3.35.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.91-.78 2.18-1.54.27-.76.27-1.43.19-1.56-.08-.14-.3-.22-.62-.38Z"/></svg> }
function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="border-l border-white/15 px-2 py-2 first:border-l-0 first:pl-0 xl:px-4 xl:py-3"><div className="mb-1 flex items-center gap-1.5 xl:mb-2"><Icon className="h-3 w-3 text-[#c9df72] xl:h-4 xl:w-4"/><span className="text-[8px] font-bold uppercase tracking-[.1em] text-[#9aaca1] xl:text-xs">{label}</span></div><span className="block max-w-[13rem] text-[10px] font-bold leading-tight sm:text-xs xl:text-lg">{value}</span></div> }
