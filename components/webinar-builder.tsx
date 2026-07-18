"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CheckCircle2, Copy, Eye, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { saveWebinarAction, type WebinarSaveState } from "@/app/actions";
import { fieldTypes, type WebinarConfig, type WebinarFormField } from "@/lib/form-types";
import { webinarEditorSchema } from "@/lib/validation";

const initialState: WebinarSaveState = { ok: false, message: "" };
const inputClass = "w-full rounded-md border border-[#173c29]/20 bg-[#fffdf7] px-3.5 py-3 text-sm text-[#12231a] outline-none transition focus:border-[#173c29]";

export function WebinarBuilder({ initial }: { initial: WebinarConfig }) {
  const [config, setConfig] = useState(initial);
  const router = useRouter();
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const action = saveWebinarAction.bind(null, initial._id || "");
  const [state, formAction, pending] = useActionState(action, initialState);
  const serialized = useMemo(() => JSON.stringify(config), [config]);
  useEffect(() => { if (state.ok && state.id && !initial._id) router.replace(`/administrator/webinars/${state.id}`); }, [state.ok, state.id, initial._id, router]);

  function set<K extends keyof WebinarConfig>(key: K, value: WebinarConfig[K]) { setConfig(current => ({ ...current, [key]: value })); }
  function updateField(index: number, patch: Partial<WebinarFormField>) { setConfig(current => ({ ...current, formFields: current.formFields.map((field, i) => i === index ? { ...field, ...patch } : field) })); }
  function move(index: number, direction: -1 | 1) { setConfig(current => { const fields = [...current.formFields]; const target = index + direction; if (target < 0 || target >= fields.length) return current; [fields[index], fields[target]] = [fields[target], fields[index]]; return { ...current, formFields: fields }; }); }
  function addField() { const id = crypto.randomUUID(); setConfig(current => ({ ...current, formFields: [...current.formFields, { id, key: `field${current.formFields.length + 1}`, label: "New question", type: "text", required: false, unique: false, placeholder: "", helpText: "", options: [] }] })); }
  function duplicateField(index: number) { setConfig(current => { const source = current.formFields[index]; return { ...current, formFields: [...current.formFields.slice(0, index + 1), { ...source, id: crypto.randomUUID(), key: `${source.key}Copy` }, ...current.formFields.slice(index + 1)] }; }); }
  function removeField(index: number) { setConfig(current => ({ ...current, formFields: current.formFields.filter((_, i) => i !== index) })); }
  function validate(event: React.FormEvent<HTMLFormElement>) { const result = webinarEditorSchema.safeParse(config); if (!result.success) { event.preventDefault(); setClientErrors(result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`)); } else setClientErrors([]); }

  const errors = clientErrors.length ? clientErrors : state.errors || [];
  return <form action={formAction} onSubmit={validate} className="space-y-8">
    <input type="hidden" name="config" value={serialized}/>
    <section className="border border-[#173c29]/20 bg-[#fffdf7]"><div className="border-b border-[#173c29]/15 px-6 py-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#526158]">Webinar details</p><h2 className="mt-2 text-2xl font-bold tracking-[-.035em]">Content and publishing</h2></div><div className="grid gap-5 p-6 md:grid-cols-2">
      <EditorInput label="Webinar title" value={config.title} onChange={value => set("title", value)} wide/>
      <EditorInput label="Public URL slug" value={config.slug} onChange={value => set("slug", value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} hint={`/webinars/${config.slug}`}/>
      <EditorInput label="Eyebrow" value={config.eyebrow} onChange={value => set("eyebrow", value)}/>
      <EditorInput label="Hero headline" value={config.heroTitle} onChange={value => set("heroTitle", value)}/>
      <EditorInput label="Hero accent line" value={config.heroAccent} onChange={value => set("heroAccent", value)}/>
      <EditorInput label="Venue / platform" value={config.venue} onChange={value => set("venue", value)}/>
      <EditorInput label="Date and time" type="datetime-local" value={config.date.slice(0, 16)} onChange={value => set("date", value)}/>
      <EditorInput label="Capacity" type="number" value={String(config.capacity)} onChange={value => set("capacity", Number(value))}/>
      <label><span className="mb-2 block text-sm font-semibold">Registration status</span><select className={inputClass} value={config.status} onChange={event => set("status", event.target.value as WebinarConfig["status"])}><option value="draft">Draft — hidden from registration</option><option value="open">Open — accepting registrations</option><option value="closed">Closed — show closed message</option><option value="completed">Completed — historical record</option></select></label>
      <EditorInput label="WhatsApp channel URL" type="url" value={config.whatsappChannel || ""} onChange={value => set("whatsappChannel", value)}/>
      <div className="rounded-md border border-[#173c29]/15 bg-[#edf0e6] p-4 md:col-span-2"><Toggle label="Repeat this webinar every week" checked={config.recurringWeekly} onChange={checked => set("recurringWeekly", checked)}/>{config.recurringWeekly && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold">Session day</span><select className={inputClass} value={config.recurrenceWeekday} onChange={event => set("recurrenceWeekday", Number(event.target.value))}>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label><EditorInput label="Session time (Pakistan)" type="time" value={config.recurrenceTime} onChange={value => set("recurrenceTime", value)}/></div>}<p className="mt-3 text-xs leading-5 text-[#607066]">Recurring webinars remain open and each weekly occurrence keeps separate deduplication and attendance records.</p></div>
      <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">Description</span><textarea className={`${inputClass} min-h-24 resize-y`} value={config.description} onChange={event => set("description", event.target.value)}/></label>
      <EditorInput label="Success message" value={config.confirmationMessage || ""} onChange={value => set("confirmationMessage", value)} wide/>
      <EditorInput label="Closed-registration message" value={config.closedMessage || ""} onChange={value => set("closedMessage", value)} wide/>
    </div></section>

    <section><div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#526158]">Registration form</p><h2 className="mt-2 text-3xl font-bold tracking-[-.04em]">Questions and validation</h2><p className="mt-2 text-sm text-[#526158]">Add, remove, reorder, and configure every response field.</p></div><button type="button" onClick={addField} className="flex items-center justify-center gap-2 rounded-md bg-[#123d29] px-4 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4"/>Add question</button></div>
      <div className="space-y-4">{config.formFields.map((field, index) => <FieldEditor key={field.id} field={field} index={index} total={config.formFields.length} update={patch => updateField(index, patch)} move={direction => move(index, direction)} duplicate={() => duplicateField(index)} remove={() => removeField(index)}/>)}</div>
      {!config.formFields.length && <div className="border border-dashed border-[#173c29]/30 p-10 text-center text-[#526158]">No questions yet. Add at least one field to publish this webinar.</div>}
    </section>

    {(errors.length > 0 || state.message) && <div className={`border p-4 ${state.ok ? "border-[#2f6a49]/25 bg-[#dfe8d7] text-[#1f583a]" : "border-red-700/20 bg-red-50 text-red-800"}`}><div className="flex gap-2 font-semibold">{state.ok && <CheckCircle2 className="h-5 w-5"/>}{state.message || "Please correct these issues:"}</div>{errors.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{errors.slice(0, 12).map(error => <li key={error}>{error}</li>)}</ul>}</div>}
    <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 border border-[#173c29]/20 bg-[#f4f0e6]/95 p-4 shadow-xl backdrop-blur"><a href={`/webinars/${config.slug}?preview=1`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-[#365b45]"><Eye className="h-4 w-4"/>Preview public page</a><button disabled={pending} className="flex items-center gap-2 rounded-md bg-[#123d29] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60"><Save className="h-4 w-4"/>{pending ? "Saving…" : "Save webinar"}</button></div>
  </form>;
}

function EditorInput({ label, value, onChange, type = "text", hint, wide = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string; wide?: boolean }) { return <label className={wide ? "md:col-span-2" : ""}><span className="mb-2 block text-sm font-semibold">{label}</span><input type={type} className={inputClass} value={value} onChange={event => onChange(event.target.value)}/>{hint && <span className="mt-1 block text-xs text-[#607066]">{hint}</span>}</label>; }

function FieldEditor({ field, index, total, update, move, duplicate, remove }: { field: WebinarFormField; index: number; total: number; update: (patch: Partial<WebinarFormField>) => void; move: (direction: -1 | 1) => void; duplicate: () => void; remove: () => void }) {
  const hasOptions = ["select", "radio"].includes(field.type);
  return <article className="border border-[#173c29]/20 bg-[#fffdf7]"><div className="flex items-center gap-2 border-b border-[#173c29]/10 bg-[#edf0e6] px-4 py-3"><GripVertical className="h-4 w-4 text-[#718078]"/><span className="mr-auto text-xs font-bold uppercase tracking-[.14em] text-[#526158]">Question {index + 1}</span><button type="button" disabled={index === 0} onClick={() => move(-1)} aria-label="Move up" className="p-2 disabled:opacity-25"><ArrowUp className="h-4 w-4"/></button><button type="button" disabled={index === total - 1} onClick={() => move(1)} aria-label="Move down" className="p-2 disabled:opacity-25"><ArrowDown className="h-4 w-4"/></button><button type="button" onClick={duplicate} aria-label="Duplicate" className="p-2"><Copy className="h-4 w-4"/></button><button type="button" onClick={remove} aria-label="Delete" className="p-2 text-[#8b2f28]"><Trash2 className="h-4 w-4"/></button></div><div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
    <EditorInput label="Question label" value={field.label} onChange={value => update({ label: value })}/><EditorInput label="Data key" value={field.key} onChange={value => update({ key: value.replace(/[^a-zA-Z0-9_]/g, "") })}/><label><span className="mb-2 block text-sm font-semibold">Field type</span><select className={inputClass} value={field.type} onChange={event => update({ type: event.target.value as WebinarFormField["type"], options: ["select", "radio"].includes(event.target.value) && !field.options?.length ? ["Option 1", "Option 2"] : field.options })}>{fieldTypes.map(type => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label><EditorInput label="Placeholder" value={field.placeholder || ""} onChange={value => update({ placeholder: value })}/>
    <EditorInput label="Help text" value={field.helpText || ""} onChange={value => update({ helpText: value })} wide/>{hasOptions && <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold">Options <span className="font-normal text-[#607066]">(one per line)</span></span><textarea className={`${inputClass} min-h-24`} value={(field.options || []).join("\n")} onChange={event => update({ options: event.target.value.split("\n").map(value => value.trim()).filter(Boolean) })}/></label>}
    <div className="flex flex-wrap items-center gap-5 md:col-span-2"><Toggle label="Required" checked={field.required} onChange={checked => update({ required: checked })}/><Toggle label="Unique per webinar" checked={field.unique} onChange={checked => update({ unique: checked })}/></div><div className="grid grid-cols-2 gap-3 md:col-span-2"><EditorInput label="Minimum length" type="number" value={field.minLength == null ? "" : String(field.minLength)} onChange={value => update({ minLength: value ? Number(value) : undefined })}/><EditorInput label="Maximum length" type="number" value={field.maxLength == null ? "" : String(field.maxLength)} onChange={value => update({ maxLength: value ? Number(value) : undefined })}/></div>
  </div></article>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-4 w-4 accent-[#173c29]"/>{label}</label>; }
