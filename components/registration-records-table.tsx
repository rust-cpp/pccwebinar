import { AttendanceToggle } from "@/components/attendance-toggle";
import { DeleteRegistration } from "@/components/delete-registration";
import type { WebinarFormField } from "@/lib/form-types";

type RegistrationRecord = Record<string, unknown> & { _id: unknown; answers?: Record<string, unknown>; createdAt?: string | Date; attended?: boolean };

function answer(record: RegistrationRecord, field: WebinarFormField) {
  const dynamic = record.answers?.[field.key];
  if (dynamic !== undefined && dynamic !== null && dynamic !== "") return String(dynamic);
  const legacy = record[field.key];
  if (typeof legacy === "boolean") return legacy ? "Yes" : "No";
  return legacy == null || legacy === "" ? "—" : String(legacy);
}

export function RegistrationRecordsTable({ records, fields }: { records: RegistrationRecord[]; fields: WebinarFormField[] }) {
  const visibleFields = fields.length ? fields : [];
  return <div className="overflow-x-auto"><table className="w-full min-w-max text-left text-sm"><thead className="border-b border-[#173c29]/15 bg-[#edf0e6] text-[10px] uppercase tracking-[.12em] text-[#526158]"><tr>{visibleFields.map(field => <th key={field.id} className="whitespace-nowrap p-4">{field.label}</th>)}<th className="p-4">Registered</th><th className="p-4">Attendance</th><th className="p-4 text-center">Actions</th></tr></thead><tbody className="divide-y divide-[#173c29]/10">{records.map(record => {
    const participant = answer(record, visibleFields.find(field => field.key === "fullName") || visibleFields[0]);
    return <tr key={String(record._id)} className="transition hover:bg-[#f3f4ed]">{visibleFields.map(field => <td key={field.id} className="max-w-[280px] p-4 align-top"><span className="block whitespace-pre-wrap break-words text-[#405247]">{answer(record, field)}</span></td>)}<td className="whitespace-nowrap p-4 text-xs text-[#526158]">{record.createdAt ? new Date(record.createdAt).toLocaleDateString("en-PK") : "—"}</td><td className="p-4"><AttendanceToggle id={String(record._id)} attended={Boolean(record.attended)}/></td><td className="p-4"><div className="flex justify-center"><DeleteRegistration id={String(record._id)} participant={participant}/></div></td></tr>;
  })}{!records.length && <tr><td colSpan={visibleFields.length + 3} className="p-16 text-center text-[#526158]">No registrations found for this webinar.</td></tr>}</tbody></table></div>;
}
