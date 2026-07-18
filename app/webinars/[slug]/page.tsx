import { notFound } from "next/navigation";
import { PublicWebinar } from "@/components/public-webinar";
import { serializeWebinar } from "@/lib/webinar-data";
import { getDatabase } from "@/lib/mongodb";
import { Webinar } from "@/models/Webinar";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { issueRegistrationToken } from "@/lib/security";
import { withNextOccurrence } from "@/lib/recurrence";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await getDatabase();
  const webinar = await Webinar.findOne({ slug }, { title: 1, description: 1 }).lean();
  return webinar ? { title: `${webinar.title} | Punjab Charities Commission`, description: webinar.description } : { title: "Webinar not found | Punjab Charities Commission" };
}

export default async function WebinarPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { slug } = await params;
  const preview = (await searchParams).preview === "1" && await isAdmin();
  await getDatabase();
  const webinar = await Webinar.findOne({ slug, ...(preview ? {} : { status: "open" }) }).lean();
  if (!webinar) notFound();
  const config = withNextOccurrence(serializeWebinar(JSON.parse(JSON.stringify(webinar))));
  return <PublicWebinar webinar={config} formToken={issueRegistrationToken(config.slug)}/>;
}
