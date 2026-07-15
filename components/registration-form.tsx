"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, Check, CheckCircle2, ChevronDown, Mail, Phone, UserRound } from "lucide-react";
import { registerNgo, type FormState } from "@/app/actions";

const initial: FormState = { ok: false, message: "" };
const ngoTypes = [
  "Social Welfare", "Education", "Health", "Drug Abuse Prevention & Narcotics Rehabilitation",
  "Human Rights", "Women Empowerment", "Child Welfare", "Environment",
  "Relief & Rehabilitation", "Community Development", "Religious & Charitable", "Other",
];

export function RegistrationForm({ closed = false }: { closed?: boolean }) {
  const [state, action, pending] = useActionState(registerNgo, initial);
  const [ngoType, setNgoType] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setNgoType("");
      setDropdownOpen(false);
    }
  }, [state.ok]);

  const field = "mt-2.5 w-full rounded-md border border-[#173c29]/25 bg-transparent px-12 py-4 text-base text-[#12231a] outline-none transition placeholder:text-[#12231a]/35 focus:border-[#173c29] focus:bg-white/40";

  return (
    <form ref={formRef} action={action}>
      <fieldset disabled={closed} className="grid gap-4 disabled:cursor-not-allowed lg:grid-cols-2 lg:gap-x-5">
      <label className="block text-base font-semibold text-[#293d31]">Full name<div className="relative"><UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#44614f]"/><input name="fullName" required minLength={3} placeholder="Enter your full name" className={field}/></div></label>
      <label className="block text-base font-semibold text-[#293d31]">Name of NGO<div className="relative"><Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#44614f]"/><input name="ngoName" required placeholder="Organization name" className={field}/></div></label>

      <div className="block text-base font-semibold text-[#293d31]">
        Type of NGO <span className="font-normal text-[#526158]">(optional)</span>
        <div ref={dropdownRef} className="relative mt-2">
          <Building2 className="pointer-events-none absolute left-4 top-[19px] z-10 h-5 w-5 text-[#44614f]"/>
          <button type="button" aria-haspopup="listbox" aria-expanded={dropdownOpen} onClick={() => setDropdownOpen(open => !open)} className={`flex w-full items-center justify-between rounded-md border bg-transparent py-4 pl-12 pr-4 text-left text-base outline-none transition ${dropdownOpen ? "border-[#173c29] bg-white/40" : "border-[#173c29]/25"}`}>
            <span className={ngoType ? "text-[#12231a]" : "text-[#12231a]/35"}>{ngoType || "Select an area of work"}</span>
            <ChevronDown className={`h-4 w-4 text-[#526158] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}/>
          </button>
          {dropdownOpen && <div role="listbox" className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-[#173c29]/20 bg-[#fffdf7] p-1.5 shadow-[0_18px_50px_rgba(18,35,26,.18)]">
            {ngoTypes.map(option => <button key={option} type="button" role="option" aria-selected={ngoType === option} onClick={() => { setNgoType(option); setDropdownOpen(false); }} className={`flex w-full items-center justify-between rounded px-3 py-3 text-left text-base transition hover:bg-[#e6eadc] ${ngoType === option ? "bg-[#dfe5d1] font-semibold text-[#12231a]" : "text-[#405247]"}`}><span>{option}</span>{ngoType === option && <Check className="h-4 w-4"/>}</button>)}
          </div>}
        </div>
        {ngoType === "Other" ? <input name="ngoType" required autoFocus placeholder="Please specify the NGO type" className={`${field} px-4`}/> : <input type="hidden" name="ngoType" value={ngoType}/>} 
      </div>

      <label className="block text-base font-semibold text-[#293d31]">Contact number<div className="relative"><Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#44614f]"/><input name="contactNumber" required inputMode="tel" placeholder="e.g. 0300 1234567" className={field}/></div></label>
      <label className="block text-base font-semibold text-[#293d31]">Email address<div className="relative"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#44614f]"/><input name="email" type="email" required autoComplete="email" placeholder="name@organization.org" className={field}/></div></label>

      <fieldset className="lg:col-span-2">
        <legend className="mb-3 text-base font-semibold text-[#293d31]">Is your NGO registered with PCC?</legend>
        <div className="grid grid-cols-2 gap-3">
          {[["yes", "Yes, registered"], ["no", "Not registered"]].map(([value, label]) => <label key={value} className="group flex cursor-pointer items-center gap-3 rounded-md border border-[#173c29]/20 p-4 text-base text-[#526158] transition has-[:checked]:border-[#173c29] has-[:checked]:bg-[#dfe5d1] has-[:checked]:font-medium has-[:checked]:text-[#12231a]"><input type="radio" name="pccRegistered" value={value} required className="peer sr-only"/><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#173c29]/40 bg-transparent transition peer-checked:border-[#173c29] peer-checked:bg-[#173c29]"><span className="h-2 w-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"/></span><span>{label}</span></label>)}
        </div>
      </fieldset>

      {state.message && <div className={`flex gap-2 rounded-md border p-3.5 text-sm lg:col-span-2 ${state.ok ? "border-[#2f6a49]/25 bg-[#dfe8d7] text-[#1f583a]" : "border-red-700/20 bg-red-50 text-red-800"}`}><CheckCircle2 className="h-5 w-5 shrink-0"/>{state.message}</div>}
      <button disabled={pending || state.ok} className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#123d29] px-5 py-4 text-base font-bold text-white transition hover:bg-[#0b2c1c] disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2">{pending ? "Confirming your seat…" : state.ok ? "Seat confirmed" : "Confirm my seat"}<ArrowRight className="h-5 w-5 transition group-hover:translate-x-1"/></button>
      <p className="text-center text-sm leading-5 text-[#526158] lg:col-span-2">Open to PCC registered and non-registered NGOs. Your details will only be used for webinar coordination.</p>
      </fieldset>
    </form>
  );
}
