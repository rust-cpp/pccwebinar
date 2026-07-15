import Image from "next/image";
import { CalendarDays, Clock3, ExternalLink, Globe2 } from "lucide-react";
import { DynamicRegistrationForm } from "@/components/dynamic-registration-form";
import type { WebinarConfig } from "@/lib/form-types";

export function PublicWebinar({ webinar }: { webinar: WebinarConfig }) {
  const date = new Date(webinar.date);
  const dateLabel = new Intl.DateTimeFormat("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Karachi" }).format(date);
  const timeLabel = new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Karachi" }).format(date);
  const closed = webinar.status !== "open";
  return <main className="min-h-screen bg-[#0b2419] text-[#f4f0e6] xl:h-screen xl:min-h-0 xl:overflow-hidden">
    <section className="mx-auto grid max-w-[1600px] xl:h-full xl:grid-cols-[1.02fr_.98fr]">
      <div className="event-panel flex flex-col justify-between px-6 py-10 sm:px-10 xl:h-full xl:px-14 xl:py-10 2xl:px-20 2xl:py-12">
        <div>
          <div className="brand-block mb-10 flex items-center gap-5 sm:mb-12"><div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#f4f0e6] p-4 sm:h-28 sm:w-28"><Image src="/pcc-logo.svg" alt="Punjab Charities Commission" width={84} height={84} priority className="h-full w-full object-contain"/></div><div><p className="max-w-md text-3xl font-bold leading-[.96] tracking-[-.045em] sm:text-4xl 2xl:text-[2.65rem]">Punjab Charities<br/>Commission</p><p className="mt-3 text-base font-semibold text-[#b7cbbd]">Government of the Punjab</p></div></div>
          <div className="programme-label mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[.18em] text-[#b7cbbd]"><span className="h-0.5 w-10 bg-[#c9df72]"/>{webinar.eyebrow}</div>
          <h1 className="max-w-4xl text-[clamp(3.8rem,6.4vw,7rem)] font-semibold leading-[.88] tracking-[-.06em]">{webinar.heroTitle}<br/><span className="text-[#c9df72]">{webinar.heroAccent}</span></h1>
          <p className="event-intro mt-7 max-w-2xl text-xl leading-8 text-[#c7d1ca] sm:text-2xl sm:leading-9">{webinar.description}</p>
          <div className="event-details mt-8 grid max-w-2xl grid-cols-2 border-y border-white/15 sm:grid-cols-3"><Info icon={CalendarDays} label="Date" value={dateLabel}/><Info icon={Clock3} label="Time" value={`${timeLabel} — PKT`}/><Info icon={Globe2} label="Venue" value={webinar.venue}/></div>
        </div>
        <div className="event-note mt-7 border-l-2 border-[#c9df72] pl-5"><p className="max-w-xl text-base font-medium leading-7 text-[#b8c6bd]">{webinar.title}</p></div>
      </div>
      <aside className="bg-[#f4f0e6] px-6 py-12 text-[#12231a] sm:px-10 xl:flex xl:h-full xl:items-start xl:overflow-y-auto xl:px-10 xl:py-8 2xl:px-14"><div className="registration-content mx-auto w-full max-w-3xl xl:my-auto">
        <p className="text-sm font-bold uppercase tracking-[.2em] text-[#52675a]">Registration</p><h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-5xl">Confirm your place at the session.</h2><p className="mt-4 max-w-2xl text-base leading-6 text-[#526158]">Complete the fields below. Required responses are marked with an asterisk.</p>
        {webinar.whatsappChannel && <div className="mt-4 flex items-center gap-4 rounded-xl border-2 border-[#1c6b43] bg-[#dcebdc] p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-6 w-6"/></div><div className="min-w-0 flex-1"><p className="text-base font-bold text-[#123d29]">Follow the PCC WhatsApp Channel</p><p className="mt-1 text-sm leading-5 text-[#365746]">Webinar updates and the joining link will be shared there.</p></div><a href={webinar.whatsappChannel} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-2 rounded-md bg-[#176b42] px-4 py-3 text-sm font-bold text-white">Follow now<ExternalLink className="h-4 w-4"/></a></div>}
        <div className="relative mt-4 border-t-2 border-[#173c29]/20 pt-4"><div className={closed ? "pointer-events-none select-none blur-[3px] opacity-30" : ""} aria-hidden={closed || undefined}><DynamicRegistrationForm slug={webinar.slug} fields={webinar.formFields} closed={closed}/></div>{closed && <div className="absolute inset-0 z-10 flex items-center justify-center px-4"><div className="w-full max-w-lg rounded-2xl border-2 border-[#173c29] bg-[#f4f0e6]/95 px-6 py-9 text-center shadow-xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-[#526158]">Registration update</p><h3 className="mt-3 text-4xl font-bold leading-[.95] tracking-[-.045em] text-[#123d29]">Registrations are closed.</h3><p className="mt-4 text-lg font-medium text-[#526158]">{webinar.closedMessage}</p></div></div>}</div>
      </div></aside>
    </section>
  </main>;
}

function WhatsAppIcon({ className }: { className?: string }) { return <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor"><path d="M16.01 3C8.84 3 3.02 8.82 3.02 15.99c0 2.28.59 4.51 1.71 6.47L3 29l6.7-1.76a12.96 12.96 0 0 0 6.3 1.61h.01C23.18 28.85 29 23.03 29 15.86 29 8.82 23.18 3 16.01 3Zm0 23.66h-.01a10.77 10.77 0 0 1-5.49-1.5l-.39-.23-3.98 1.05 1.06-3.88-.25-.4a10.77 10.77 0 1 1 9.06 4.96Zm5.91-8.07c-.32-.16-1.91-.94-2.21-1.05-.3-.11-.51-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.37-.5-2.6-1.61a9.73 9.73 0 0 1-1.8-2.24c-.19-.32-.02-.5.14-.66.15-.15.32-.38.49-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.57-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.14 1.11-1.14 2.7 0 1.59 1.16 3.13 1.32 3.35.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.91-.78 2.18-1.54.27-.76.27-1.43.19-1.56-.08-.14-.3-.22-.62-.38Z"/></svg> }
function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="border-b border-white/15 px-3 py-4 first:pl-0 even:border-l sm:border-b-0 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0"><div className="mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-[#c9df72]"/><span className="text-xs font-bold uppercase tracking-[.14em] text-[#9aaca1]">{label}</span></div><span className="block max-w-[13rem] text-lg font-bold leading-tight xl:text-xl">{value}</span></div> }
