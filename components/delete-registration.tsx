"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { deleteRegistration } from "@/app/actions";

export function DeleteRegistration({ id, participant }: { id: string; participant: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      await deleteRegistration(id);
      setOpen(false);
    });
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label={`Delete ${participant}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#8b4b42] transition hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4"/></button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-[#07150e]/65 p-5" role="dialog" aria-modal="true" aria-labelledby={`delete-${id}`}>
      <div className="w-full max-w-md border border-[#173c29]/20 bg-[#fffdf7] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#8b4b42]">Delete registration</p><h2 id={`delete-${id}`} className="mt-3 text-2xl font-bold tracking-[-.03em] text-[#12231a]">Remove {participant}?</h2></div><button type="button" onClick={() => setOpen(false)} className="text-[#526158] hover:text-[#12231a]" aria-label="Close"><X className="h-5 w-5"/></button></div>
        <p className="mt-4 text-sm leading-6 text-[#526158]">This attendee’s registration and attendance record will be permanently deleted. This action cannot be undone.</p>
        <div className="mt-7 grid grid-cols-2 gap-3"><button type="button" onClick={() => setOpen(false)} disabled={pending} className="border border-[#173c29]/25 px-4 py-3 text-sm font-semibold text-[#293d31]">Cancel</button><button type="button" onClick={remove} disabled={pending} className="bg-[#8b2f28] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{pending ? "Deleting…" : "Delete record"}</button></div>
      </div>
    </div>}
  </>;
}
