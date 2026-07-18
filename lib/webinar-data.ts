import { currentWebinar } from "@/lib/webinar";
import { defaultFormFields, type WebinarConfig } from "@/lib/form-types";

export function serializeWebinar(data: Record<string, unknown>): WebinarConfig {
  return {
    _id: data._id ? String(data._id) : undefined,
    title: String(data.title || "NGO Webinar"),
    slug: String(data.slug || currentWebinar.slug),
    eyebrow: String(data.eyebrow || currentWebinar.eyebrow),
    heroTitle: String(data.heroTitle || currentWebinar.heroTitle),
    heroAccent: String(data.heroAccent || currentWebinar.heroAccent),
    description: String(data.description || currentWebinar.description),
    date: new Date(String(data.date || currentWebinar.date)).toISOString(),
    venue: String(data.venue || "Online webinar"),
    capacity: Number(data.capacity || 250),
    status: (data.status || "closed") as WebinarConfig["status"],
    recurringWeekly: Boolean(data.recurringWeekly),
    recurrenceWeekday: Number(data.recurrenceWeekday ?? 4),
    recurrenceTime: String(data.recurrenceTime || "11:00"),
    whatsappChannel: String(data.whatsappChannel || ""),
    confirmationMessage: String(data.confirmationMessage || "Your registration is confirmed."),
    closedMessage: String(data.closedMessage || "Thank you for your interest. See you in the next webinar."),
    formFields: Array.isArray(data.formFields) && data.formFields.length ? JSON.parse(JSON.stringify(data.formFields)) : defaultFormFields,
  };
}
