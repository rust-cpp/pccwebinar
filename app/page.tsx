import { PublicWebinar } from "@/components/public-webinar";
import { getDatabase } from "@/lib/mongodb";
import { currentWebinar } from "@/lib/webinar";
import { Webinar } from "@/models/Webinar";
import { serializeWebinar } from "@/lib/webinar-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data: Record<string, unknown> = currentWebinar;
  try {
    await getDatabase();
    const found = await Webinar.findOne({ status: "open" }).sort({ date: -1 }).lean() || await Webinar.findOne({ status: { $in: ["closed", "completed"] } }).sort({ date: -1 }).lean();
    if (found) data = JSON.parse(JSON.stringify(found));
  } catch { /* fallback keeps the public page available */ }
  return <PublicWebinar webinar={serializeWebinar(data)}/>;
}
