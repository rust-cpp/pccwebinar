import type { WebinarConfig } from "@/lib/form-types";

const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

export function getNextOccurrence(webinar: Pick<WebinarConfig, "date" | "recurringWeekly" | "recurrenceWeekday" | "recurrenceTime">, now = new Date()) {
  if (!webinar.recurringWeekly) {
    const date = new Date(webinar.date);
    return { date, key: pakistanDateKey(date) };
  }
  const pakistanNow = new Date(now.getTime() + PK_OFFSET_MS);
  const [hour, minute] = webinar.recurrenceTime.split(":").map(Number);
  let daysAhead = (webinar.recurrenceWeekday - pakistanNow.getUTCDay() + 7) % 7;
  const currentMinutes = pakistanNow.getUTCHours() * 60 + pakistanNow.getUTCMinutes();
  if (daysAhead === 0 && currentMinutes >= hour * 60 + minute) daysAhead = 7;
  const date = new Date(Date.UTC(pakistanNow.getUTCFullYear(), pakistanNow.getUTCMonth(), pakistanNow.getUTCDate() + daysAhead, hour - 5, minute));
  return { date, key: pakistanDateKey(date) };
}

export function pakistanDateKey(date: Date) {
  return new Date(date.getTime() + PK_OFFSET_MS).toISOString().slice(0, 10);
}

export function withNextOccurrence<T extends WebinarConfig>(webinar: T): T {
  return { ...webinar, date: getNextOccurrence(webinar).date.toISOString() };
}
