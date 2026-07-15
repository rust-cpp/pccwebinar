import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdmin } from "@/lib/auth";
import { defaultFormFields, type WebinarFormField } from "@/lib/form-types";
import { getDatabase } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { Webinar } from "@/models/Webinar";

function value(record: Record<string, unknown>, field: WebinarFormField) {
  const answers = record.answers;
  const dynamic = answers instanceof Map ? answers.get(field.key) : typeof answers === "object" && answers !== null ? (answers as Record<string, unknown>)[field.key] : undefined;
  const answer = dynamic ?? record[field.key];
  if (typeof answer === "boolean") return answer ? "Yes" : "No";
  return answer == null ? "" : String(answer);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = request.nextUrl.searchParams.get("webinar");
  if (!slug) return NextResponse.json({ error: "Webinar is required" }, { status: 400 });
  await getDatabase();
  const [webinar, records] = await Promise.all([Webinar.findOne({ slug }).lean(), Registration.find({ webinarSlug: slug }).sort({ createdAt: 1 }).lean()]);
  if (!webinar) return NextResponse.json({ error: "Webinar not found" }, { status: 404 });
  const fields = (webinar.formFields?.length ? webinar.formFields : defaultFormFields) as WebinarFormField[];
  const data = records.map((record, index) => ({ "Sr. No.": index + 1, ...Object.fromEntries(fields.map(field => [field.label, value(record, field)])), "Seat Confirmed": record.seatConfirmed ? "Yes" : "No", "Attended": record.attended ? "Yes" : "No", "Registration Date": new Date(record.createdAt).toLocaleString("en-PK") }));
  const sheet = XLSX.utils.json_to_sheet(data); sheet["!cols"] = [{ wch: 8 }, ...fields.map(() => ({ wch: 26 })), { wch: 16 }, { wch: 12 }, { wch: 22 }];
  const details = XLSX.utils.json_to_sheet([{ Title: webinar.title, Date: new Date(webinar.date).toLocaleString("en-PK"), Venue: webinar.venue, Status: webinar.status, Capacity: webinar.capacity, Registrations: records.length }]);
  const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, details, "Webinar Details"); XLSX.utils.book_append_sheet(book, sheet, "Registrations");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${slug}-registrations.xlsx"` } });
}
