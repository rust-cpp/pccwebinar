"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, ChevronDown } from "lucide-react";
import { registerForWebinar, type FormState } from "@/app/actions";
import type { WebinarFormField } from "@/lib/form-types";
import { validateDynamicAnswers } from "@/lib/validation";

const initial: FormState = { ok: false, message: "", fieldErrors: {} };

export function DynamicRegistrationForm({ slug, fields, formToken, closed = false }: { slug: string; fields: WebinarFormField[]; formToken: string; closed?: boolean }) {
  const action = registerForWebinar.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initial);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state.ok]);

  function validate(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const raw = Object.fromEntries(fields.map(field => {
      const selected = String(data.get(field.key) || "");
      return [field.key, selected === "Other" ? data.get(`${field.key}__other`) : selected];
    }));
    const result = validateDynamicAnswers(fields, raw);
    if (!result.success) {
      event.preventDefault();
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) { const key = String(issue.path[0]); if (!errors[key]) errors[key] = issue.message; }
      setClientErrors(errors);
    } else setClientErrors({});
  }

  const errors = { ...clientErrors, ...(state.fieldErrors || {}) };
  return <form ref={formRef} action={formAction} onSubmit={validate} noValidate>
    <input type="hidden" name="_formToken" value={formToken}/>
    <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off"/></label>
    <fieldset disabled={closed || pending || state.ok} className="grid gap-4 disabled:cursor-not-allowed lg:grid-cols-2 lg:gap-x-5">
      {fields.map(field => <DynamicField key={field.id} field={field} error={errors[field.key]}/>) }
      {state.message && <div className={`flex gap-2 rounded-md border p-3.5 text-sm lg:col-span-2 ${state.ok ? "border-[#2f6a49]/25 bg-[#dfe8d7] text-[#1f583a]" : "border-red-700/20 bg-red-50 text-red-800"}`}>{state.ok ? <CheckCircle2 className="h-5 w-5 shrink-0"/> : <AlertCircle className="h-5 w-5 shrink-0"/>}{state.message}</div>}
      <button className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#123d29] px-5 py-4 text-base font-bold text-white transition hover:bg-[#0b2c1c] disabled:opacity-60 lg:col-span-2">{pending ? "Submitting…" : state.ok ? "Registration confirmed" : "Confirm registration"}<ArrowRight className="h-5 w-5 transition group-hover:translate-x-1"/></button>
      <p className="text-center text-sm leading-5 text-[#526158] lg:col-span-2">Your information is used only to manage this webinar and participant attendance.</p>
    </fieldset>
  </form>;
}

function DynamicField({ field, error }: { field: WebinarFormField; error?: string }) {
  const fullWidth = ["textarea", "radio", "checkbox"].includes(field.type);
  const label = <>{field.label}{field.required && <span className="ml-1 text-[#8b2f28]">*</span>}</>;
  const common = `mt-2.5 w-full rounded-md border bg-transparent px-4 py-3.5 text-base text-[#12231a] outline-none transition placeholder:text-[#12231a]/35 ${error ? "border-red-600" : "border-[#173c29]/25 focus:border-[#173c29] focus:bg-white/40"}`;
  if (field.type === "select") return <CustomSelect field={field} error={error}/>;
  if (field.type === "radio") return <fieldset className={fullWidth ? "lg:col-span-2" : ""}><legend className="text-base font-semibold text-[#293d31]">{label}</legend><div className="mt-2.5 grid gap-2 sm:grid-cols-2">{field.options?.map(option => <label key={option} className="group flex cursor-pointer items-center gap-3 rounded-md border border-[#173c29]/20 p-3 text-base text-[#526158] has-[:checked]:border-[#173c29] has-[:checked]:bg-[#dfe5d1] has-[:checked]:font-medium has-[:checked]:text-[#12231a]"><input className="peer sr-only" type="radio" name={field.key} value={option}/><span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#173c29]/40 peer-checked:bg-[#173c29]"><span className="h-2 w-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"/></span>{option}</label>)}</div><FieldMeta field={field} error={error}/></fieldset>;
  if (field.type === "checkbox") return <label className="flex cursor-pointer items-start gap-3 lg:col-span-2"><input type="checkbox" name={field.key} value="Yes" className="mt-1 h-5 w-5 accent-[#173c29]"/><span><span className="text-base font-semibold text-[#293d31]">{label}</span><FieldMeta field={field} error={error}/></span></label>;
  return <label className={fullWidth ? "lg:col-span-2" : ""}><span className="text-base font-semibold text-[#293d31]">{label}</span>{field.type === "textarea" ? <textarea name={field.key} placeholder={field.placeholder} minLength={field.minLength} maxLength={field.maxLength} rows={3} className={`${common} resize-y`}/> : <input name={field.key} type={field.type} inputMode={field.type === "tel" ? "tel" : undefined} placeholder={field.placeholder} minLength={field.minLength} maxLength={field.maxLength} className={common}/>}<FieldMeta field={field} error={error}/></label>;
}

function FieldMeta({ field, error }: { field: WebinarFormField; error?: string }) { return <>{error ? <p className="mt-1.5 text-sm font-medium text-red-700">{error}</p> : field.helpText ? <p className="mt-1.5 text-sm text-[#607066]">{field.helpText}</p> : null}</>; }

function CustomSelect({ field, error }: { field: WebinarFormField; error?: string }) {
  const [open, setOpen] = useState(false); const [value, setValue] = useState(""); const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  return <div ref={root} className="relative"><p className="text-base font-semibold text-[#293d31]">{field.label}{field.required && <span className="ml-1 text-[#8b2f28]">*</span>}</p><input type="hidden" name={field.key} value={value}/><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={`mt-2.5 flex w-full items-center justify-between rounded-md border bg-transparent px-4 py-3.5 text-left text-base ${error ? "border-red-600" : "border-[#173c29]/25"}`}><span className={value ? "text-[#12231a]" : "text-[#12231a]/35"}>{value || field.placeholder || "Select an option"}</span><ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}/></button>{open && <div className="absolute z-40 mt-2 max-h-60 w-full overflow-auto rounded-md border border-[#173c29]/20 bg-[#fffdf7] p-1.5 shadow-xl">{field.options?.map(option => <button key={option} type="button" onClick={() => { setValue(option); setOpen(false); }} className={`flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm hover:bg-[#e6eadc] ${value === option ? "bg-[#dfe5d1] font-semibold" : ""}`}>{option}{value === option && <Check className="h-4 w-4"/>}</button>)}</div>}{value === "Other" && <input name={`${field.key}__other`} autoFocus placeholder="Please specify" className="mt-2 w-full rounded-md border border-[#173c29]/25 bg-transparent px-4 py-3 text-base outline-none focus:border-[#173c29]"/>}<FieldMeta field={field} error={error}/></div>;
}
