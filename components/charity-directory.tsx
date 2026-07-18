"use client";

import { Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";

type DirectoryData = { names: string[]; page: number; total: number; totalPages: number };

export function CharityDirectory() {
  const [query, setQuery] = useState(""); const [page, setPage] = useState(1); const [data, setData] = useState<DirectoryData>({ names: [], page: 1, total: 0, totalPages: 1 }); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => { setLoading(true); try { const params = new URLSearchParams({ page: String(page), ...(query ? { q: query } : {}) }); const response = await fetch(`/api/public/charities?${params}`, { cache: "no-store", signal: controller.signal }); if (response.ok) setData(await response.json()); } catch { /* keep the last successful directory page */ } finally { if (!controller.signal.aborted) setLoading(false); } };
    const delay = window.setTimeout(load, 250);
    const refresh = window.setInterval(load, 15000);
    return () => { controller.abort(); window.clearTimeout(delay); window.clearInterval(refresh); };
  }, [page, query]);
  return <div><div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#526158]"/><input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search charity by name" className="w-full rounded-md border border-[#173c29]/25 bg-[#fffdf7] py-4 pl-12 pr-4 text-base outline-none focus:border-[#173c29]"/></div><div className="mt-5 flex items-center justify-between text-sm text-[#607066]"><p>{data.total.toLocaleString()} registered charities</p>{loading && <p>Updating…</p>}</div><div className={`mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading ? "opacity-60" : ""}`}>{data.names.map(name => <article key={name} className="flex min-h-24 items-center gap-3 border border-[#173c29]/15 bg-[#fffdf7] p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dfe8d7] text-[#1f583a]"><Building2 className="h-5 w-5"/></div><h2 className="text-base font-bold leading-5 text-[#173c29]">{name}</h2></article>)}</div>{!loading && !data.names.length && <div className="mt-4 border border-dashed border-[#173c29]/25 p-12 text-center text-[#607066]">No charity matches this search.</div>}<div className="mt-7 flex items-center justify-between border-t border-[#173c29]/15 pt-5"><p className="text-sm text-[#607066]">Page {data.page} of {data.totalPages}</p><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="flex items-center gap-1 rounded-md border border-[#173c29]/20 px-3 py-2 text-sm font-semibold disabled:opacity-30"><ChevronLeft className="h-4 w-4"/>Previous</button><button disabled={page >= data.totalPages} onClick={() => setPage(value => value + 1)} className="flex items-center gap-1 rounded-md border border-[#173c29]/20 px-3 py-2 text-sm font-semibold disabled:opacity-30">Next<ChevronRight className="h-4 w-4"/></button></div></div></div>;
}
