import Image from "next/image";
import { CalendarDays, Clock3, ExternalLink, Globe2 } from "lucide-react";
import { RegistrationForm } from "@/components/registration-form";

export default function Home() {
  return <main className="min-h-screen bg-[#0b2419] text-[#f4f0e6] lg:h-screen lg:min-h-0 lg:overflow-hidden">
    <section className="mx-auto grid max-w-[1600px] lg:h-full lg:grid-cols-[1.08fr_.92fr]">
      <div className="event-panel flex flex-col justify-between px-6 py-10 sm:px-10 lg:h-full lg:px-14 lg:py-10 xl:px-20 xl:py-12">
        <div>
          <div className="brand-block mb-10 flex items-center gap-5 sm:mb-12">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#f4f0e6] p-4 sm:h-28 sm:w-28"><Image src="/pcc-logo.svg" alt="Punjab Charities Commission" width={84} height={84} priority className="h-full w-full object-contain"/></div>
            <div><p className="max-w-md text-3xl font-bold leading-[.96] tracking-[-.045em] sm:text-4xl xl:text-[2.65rem]">Punjab Charities<br/>Commission</p><p className="mt-3 text-base font-semibold text-[#b7cbbd]">Government of the Punjab</p></div>
          </div>
          <div className="programme-label mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[.18em] text-[#b7cbbd]"><span className="h-0.5 w-10 bg-[#c9df72]"/>Capacity Building &amp; Compliance Awareness</div>
          <h1 className="max-w-4xl text-[clamp(4.25rem,7vw,7.5rem)] font-semibold leading-[.86] tracking-[-.065em]">Build stronger.<br/><span className="text-[#c9df72]">Serve better.</span></h1>
          <p className="event-intro mt-7 max-w-2xl text-xl leading-8 text-[#c7d1ca] sm:text-2xl sm:leading-9">A focused capacity-building and compliance-awareness session for the people and organizations working to improve lives across Punjab.</p>
          <div className="event-details mt-8 grid max-w-2xl grid-cols-2 border-y border-white/15 sm:grid-cols-3">
            <Info icon={CalendarDays} label="Date" value="Thursday, 16 July 2026"/>
            <Info icon={Clock3} label="Time" value="11:00 AM — Pakistan Standard Time"/>
            <Info icon={Globe2} label="Venue" value="Online webinar"/>
          </div>
        </div>
        <div className="event-note mt-7 border-l-2 border-[#c9df72] pl-5"><p className="max-w-xl text-base font-medium leading-7 text-[#b8c6bd]">Open to every NGO—whether registered with the Punjab Charities Commission or not. Participation is free; advance registration is required.</p></div>
      </div>

      <aside id="registration" className="bg-[#f4f0e6] px-6 py-14 text-[#12231a] sm:px-10 lg:flex lg:h-full lg:items-center lg:overflow-hidden lg:px-10 lg:py-6 xl:px-14">
        <div className="registration-content mx-auto w-full max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-[#52675a]">Registration</p>
          <h2 className="mt-3 max-w-xl text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-5xl">Confirm your place at the session.</h2>
          <p className="mt-4 max-w-xl text-base leading-6 text-[#526158]">Share a few details about yourself and your organization. You will be added to the confirmed attendee list.</p>
          <div className="mt-4 flex items-center gap-4 rounded-xl border-2 border-[#1c6b43] bg-[#dcebdc] p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-6 w-6"/></div>
            <div className="min-w-0 flex-1"><p className="text-base font-bold text-[#123d29]">Follow the PCC WhatsApp Channel</p><p className="mt-1 text-sm leading-5 text-[#365746]">The webinar joining link will be shared there. Only NGOs registered through this form will be allowed to attend.</p></div>
            <a href="https://whatsapp.com/channel/0029Vb7jNfsFSAswgqgwBp3R" target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-2 rounded-md bg-[#176b42] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#105536]">Follow now<ExternalLink className="h-4 w-4"/></a>
          </div>
          <div className="relative mt-4 border-t-2 border-[#173c29]/20 pt-4">
            <div className="pointer-events-none select-none blur-[3px] opacity-35" aria-hidden="true"><RegistrationForm closed/></div>
            <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
              <div className="w-full max-w-lg rounded-2xl border-2 border-[#173c29] bg-[#f4f0e6]/95 px-6 py-9 text-center shadow-[0_20px_60px_rgba(18,35,26,.22)] backdrop-blur-md">
                <p className="text-sm font-bold uppercase tracking-[.2em] text-[#526158]">Registration update</p>
                <h3 className="mt-3 text-4xl font-bold leading-[.95] tracking-[-.045em] text-[#123d29] sm:text-5xl">Registrations are closed.</h3>
                <p className="mt-4 text-lg font-medium text-[#526158]">Thank you for your interest. See you in the next webinar.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>
}

function WhatsAppIcon({ className }: { className?: string }) { return <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor"><path d="M16.01 3C8.84 3 3.02 8.82 3.02 15.99c0 2.28.59 4.51 1.71 6.47L3 29l6.7-1.76a12.96 12.96 0 0 0 6.3 1.61h.01C23.18 28.85 29 23.03 29 15.86 29 8.82 23.18 3 16.01 3Zm0 23.66h-.01a10.77 10.77 0 0 1-5.49-1.5l-.39-.23-3.98 1.05 1.06-3.88-.25-.4a10.77 10.77 0 1 1 9.06 4.96Zm5.91-8.07c-.32-.16-1.91-.94-2.21-1.05-.3-.11-.51-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.32-.16-1.37-.5-2.6-1.61a9.73 9.73 0 0 1-1.8-2.24c-.19-.32-.02-.5.14-.66.15-.15.32-.38.49-.57.16-.19.22-.32.32-.54.11-.22.05-.4-.03-.57-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.14 1.11-1.14 2.7 0 1.59 1.16 3.13 1.32 3.35.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.25 1.48.21 2.03.13.62-.09 1.91-.78 2.18-1.54.27-.76.27-1.43.19-1.56-.08-.14-.3-.22-.62-.38Z"/></svg> }

function Info({icon:Icon,label,value}:{icon:typeof CalendarDays;label:string;value:string}) { return <div className="border-b border-white/15 px-3 py-4 first:pl-0 even:border-l sm:border-b-0 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0"><div className="mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-[#c9df72]"/><span className="text-xs font-bold uppercase tracking-[.14em] text-[#9aaca1]">{label}</span></div><span className="block max-w-[13rem] text-lg font-bold leading-tight text-[#f4f0e6] xl:text-xl">{value}</span></div> }
