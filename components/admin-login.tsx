"use client";
import { useActionState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { loginAdmin, type FormState } from "@/app/actions";
const initial: FormState = { ok: false, message: "" };
export function AdminLogin() { const [state, action, pending] = useActionState(loginAdmin, initial); return <form action={action} className="mt-8 space-y-4"><label className="block text-sm text-white/60">Admin password<div className="relative mt-2"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lime/70"/><input name="password" type="password" required autoFocus className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 outline-none focus:border-lime/50"/></div></label>{state.message&&<p className="text-sm text-red-300">{state.message}</p>}<button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3.5 font-bold text-ink">{pending?"Signing in…":"Access dashboard"}<ArrowRight className="h-4 w-4"/></button></form> }
