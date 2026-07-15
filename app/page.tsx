import Image from "next/image";
import { CalendarX2 } from "lucide-react";
import { PublicWebinar } from "@/components/public-webinar";
import { getDatabase } from "@/lib/mongodb";
import { Webinar } from "@/models/Webinar";
import { serializeWebinar } from "@/lib/webinar-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  let webinar: ReturnType<typeof serializeWebinar> | null = null;
  try {
    await getDatabase();
    const live = await Webinar.findOne({ status: "open" }).sort({ date: -1 }).lean();
    if (live) webinar = serializeWebinar(JSON.parse(JSON.stringify(live)));
  } catch { /* show a safe unavailable state instead of exposing archived content */ }
  return webinar ? <PublicWebinar webinar={webinar}/> : <NoLiveWebinar/>;
}

function NoLiveWebinar() { return <main className="grid min-h-screen place-items-center bg-[#0b2419] px-6 text-[#f4f0e6]"><div className="max-w-2xl text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#f4f0e6] p-4"><Image src="/pcc-logo.svg" alt="Punjab Charities Commission" width={84} height={84} className="h-full w-full object-contain" priority/></div><p className="mt-8 text-sm font-bold uppercase tracking-[.2em] text-[#b7cbbd]">Punjab Charities Commission</p><CalendarX2 className="mx-auto mt-10 h-9 w-9 text-[#c9df72]"/><h1 className="mt-5 text-5xl font-bold leading-[.95] tracking-[-.055em] sm:text-7xl">No live webinar right now.</h1><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#b8c6bd]">Registration will appear here when the next webinar is published and opened by the Commission.</p></div></main>; }
