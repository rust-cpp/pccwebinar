import { notFound } from "next/navigation";
import { PublicWebinar } from "@/components/public-webinar";
import { serializeWebinar } from "@/lib/webinar-data";
import { getDatabase } from "@/lib/mongodb";
import { Webinar } from "@/models/Webinar";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await getDatabase();
  const webinar = await Webinar.findOne({ slug }, { title: 1, description: 1 }).lean();
  return webinar ? { title: `${webinar.title} | Punjab Charities Commission`, description: webinar.description } : { title: "Webinar not found | Punjab Charities Commission" };
}

export default async function WebinarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await getDatabase();
  const webinar = await Webinar.findOne({ slug }).lean();
  if (!webinar) notFound();
  return <PublicWebinar webinar={serializeWebinar(JSON.parse(JSON.stringify(webinar)))}/>;
}
