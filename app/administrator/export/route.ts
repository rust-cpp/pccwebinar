import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { currentWebinar } from "@/lib/webinar";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = request.nextUrl.searchParams.get("webinar") || currentWebinar.slug;
  await getDatabase();
  const rows = await Registration.find({ webinarSlug: slug }).sort({ createdAt: 1 }).lean();
  const data = rows.map((r, i) => ({ "Sr. No.": i + 1, "Full Name": r.fullName, "Name of NGO": r.ngoName, "Type of NGO": r.ngoType || "", "PCC Registered": r.pccRegistered ? "Yes" : "No", "Contact Number": r.contactNumber, "Email Address": r.email, "Seat Confirmed": r.seatConfirmed ? "Yes" : "No", "Attended": r.attended ? "Yes" : "No", "Registration Date": new Date(r.createdAt).toLocaleString("en-PK") }));
  const sheet = XLSX.utils.json_to_sheet(data); sheet["!cols"] = [{wch:8},{wch:24},{wch:34},{wch:22},{wch:16},{wch:18},{wch:30},{wch:16},{wch:12},{wch:22}];
  const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Registrations");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${slug}-registrations.xlsx"` } });
}
