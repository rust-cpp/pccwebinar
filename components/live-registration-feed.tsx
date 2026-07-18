"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, Radio } from "lucide-react";
import { useEffect, useState } from "react";

export function LiveRegistrationFeed() {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => { try { const response = await fetch("/api/public/recent-charities", { cache: "no-store", signal: controller.signal }); if (response.ok) setNames((await response.json()).names || []); } catch { /* retain the last successful list */ } };
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 10000);
    return () => { controller.abort(); window.clearTimeout(initial); window.clearInterval(timer); };
  }, []);
  const tickerRows = [rotate(names, 0), rotate(names, 4), rotate(names, 8)];
  return <div className="live-feed mt-5 border-t border-white/15 pt-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#b7cbbd]"><Radio className="h-3.5 w-3.5 text-[#c9df72]"/>Live registrations</div><Link href="/charities" className="flex items-center gap-1 text-xs font-semibold text-[#c9df72]">Charity directory<ArrowUpRight className="h-3.5 w-3.5"/></Link></div>
    {names.length ? <><div className="mt-3 rounded-lg bg-white/[.07] p-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#9aaca1]">Recently registered</p><div className="grid grid-cols-2 gap-x-4 gap-y-2">{names.slice(0, 4).map(name => <div key={name} className="flex min-w-0 items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c9df72] text-[#123d29]"><Building2 className="h-3.5 w-3.5"/></span><span className="truncate text-xs font-bold text-white">{name}</span></div>)}</div></div><div className="mt-2 space-y-1.5">{tickerRows.map((row, rowIndex) => <div key={rowIndex} className="ticker-window overflow-hidden"><div className={`ticker-track flex w-max gap-2 ${rowIndex === 1 ? "ticker-track--reverse" : rowIndex === 2 ? "ticker-track--slow" : ""}`}>{[...row, ...row].map((name, index) => <span key={`${rowIndex}-${name}-${index}`} className="whitespace-nowrap rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium text-[#d7dfd9]">{name}</span>)}</div></div>)}</div></> : <div className="mt-3 rounded-lg border border-dashed border-white/15 px-3 py-4 text-sm text-[#9aaca1]">New charity registrations will appear here automatically.</div>}
  </div>;
}

function rotate(names: string[], offset: number) {
  if (!names.length) return names;
  const start = offset % names.length;
  return [...names.slice(start), ...names.slice(0, start)];
}
