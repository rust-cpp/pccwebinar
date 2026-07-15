"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/lib/mongodb";
import { ensureRegistrationIndexes, Registration } from "@/models/Registration";
import { Webinar } from "@/models/Webinar";
import { createAdminSession, isAdmin } from "@/lib/auth";
import { createHash } from "crypto";
import { defaultFormFields, type WebinarFormField } from "@/lib/form-types";
import { validateDynamicAnswers, webinarEditorSchema } from "@/lib/validation";
import { z } from "zod";

export type FormState = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

function dedupeToken(slug: string, key: string, value: string) {
  return `${slug}:${key}:${createHash("sha256").update(value).digest("hex")}`;
}

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid record ID.");
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export async function registerForWebinar(slug: string, _: FormState, formData: FormData): Promise<FormState> {
  if (!slugSchema.safeParse(slug).success) return { ok: false, message: "This webinar link is invalid." };
  try {
    await getDatabase();
    await ensureRegistrationIndexes();
    const webinar = await Webinar.findOne({ slug }).lean();
    if (!webinar) return { ok: false, message: "This webinar could not be found." };
    if (webinar.status !== "open") return { ok: false, message: webinar.closedMessage || "Registrations for this webinar are closed." };
    const fields = ((webinar.formFields?.length ? webinar.formFields : defaultFormFields) as WebinarFormField[]).map(field => ({ ...field }));
    const rawAnswers: Record<string, string> = {};
    for (const field of fields) {
      const selected = String(formData.get(field.key) || "");
      rawAnswers[field.key] = selected === "Other" ? String(formData.get(`${field.key}__other`) || "") : selected;
    }
    const parsed = validateDynamicAnswers(fields, rawAnswers);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) { const key = String(issue.path[0] || "form"); if (!fieldErrors[key]) fieldErrors[key] = issue.message; }
      return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
    }
    const uniqueFields = fields.filter(field => field.unique && parsed.data[field.key]);
    const tokenMap = new Map(uniqueFields.map(field => [dedupeToken(slug, field.key, String(parsed.data[field.key])), field]));
    const tokens = [...tokenMap.keys()];
    if (tokens.length) {
      const legacyConditions = uniqueFields.filter(field => ["contactNumber", "email"].includes(field.key)).map(field => ({ [field.key]: parsed.data[field.key] }));
      const duplicate = await Registration.findOne({ webinarSlug: slug, $or: [{ dedupeTokens: { $in: tokens } }, ...legacyConditions] }).lean();
      if (duplicate) {
        const matchedToken = duplicate.dedupeTokens?.find((token: string) => tokenMap.has(token));
        const field = matchedToken ? tokenMap.get(matchedToken) : uniqueFields.find(candidate => String(duplicate[candidate.key] || "") === String(parsed.data[candidate.key]));
        return { ok: false, message: `${field?.label || "This value"} is already registered for this webinar.`, fieldErrors: field ? { [field.key]: "Already registered." } : undefined };
      }
    }
    const count = await Registration.countDocuments({ webinarSlug: slug });
    if (webinar.capacity && count >= webinar.capacity) return { ok: false, message: "This webinar has reached its registration capacity." };
    const answers = parsed.data as Record<string, string>;
    await Registration.create({
      webinarSlug: slug,
      answers,
      dedupeTokens: tokens,
      fullName: answers.fullName || "",
      ngoName: answers.ngoName || "",
      ngoType: answers.ngoType || "",
      contactNumber: answers.contactNumber || undefined,
      email: answers.email || undefined,
      pccRegistered: /^yes/i.test(answers.pccRegistered || ""),
      seatConfirmed: true,
    });
    revalidatePath("/administrator");
    revalidatePath(`/webinars/${slug}`);
    return { ok: true, message: webinar.confirmationMessage || "Your registration is confirmed." };
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) return { ok: false, message: "A unique response is already registered for this webinar. Please check your phone number or email." };
    return { ok: false, message: "Registration could not be saved. Please try again shortly." };
  }
}

export async function loginAdmin(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ password: z.string().min(1, "Password is required.").max(200) }).safeParse({ password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (!process.env.ADMIN_PASSWORD) return { ok: false, message: "ADMIN_PASSWORD is not configured." };
  if (parsed.data.password !== process.env.ADMIN_PASSWORD) return { ok: false, message: "Incorrect password." };
  await createAdminSession(); redirect("/administrator");
}

export async function toggleAttendance(id: string, value: boolean) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const parsed = z.object({ id: objectIdSchema, value: z.boolean() }).parse({ id, value });
  await getDatabase(); await Registration.findByIdAndUpdate(parsed.id, { attended: parsed.value }); revalidatePath("/administrator");
}

export async function deleteRegistration(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const validId = objectIdSchema.parse(id);
  await getDatabase();
  await Registration.findByIdAndDelete(validId);
  revalidatePath("/administrator");
}

export type WebinarSaveState = { ok: boolean; message: string; id?: string; slug?: string; errors?: string[] };

export async function saveWebinarAction(id: string, _: WebinarSaveState, formData: FormData): Promise<WebinarSaveState> {
  if (!(await isAdmin())) return { ok: false, message: "Your administrator session has expired." };
  let input: unknown;
  try { input = JSON.parse(String(formData.get("config") || "{}")); }
  catch { return { ok: false, message: "The webinar configuration is invalid." }; }
  const parsed = webinarEditorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted configuration issues.", errors: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) };
  const parsedId = id ? objectIdSchema.safeParse(id) : null;
  if (id && !parsedId?.success) return { ok: false, message: "The webinar ID is invalid." };
  await getDatabase();
  const conflict = await Webinar.findOne({ slug: parsed.data.slug, ...(parsedId?.success ? { _id: { $ne: parsedId.data } } : {}) }, { _id: 1 }).lean();
  if (conflict) return { ok: false, message: "Another webinar already uses this public URL slug." };
  const pakistanDate = /(?:Z|[+-]\d{2}:?\d{2})$/.test(parsed.data.date) ? new Date(parsed.data.date) : new Date(`${parsed.data.date}:00+05:00`);
  const payload = { ...parsed.data, date: pakistanDate };
  const saved = parsedId?.success
    ? await Webinar.findByIdAndUpdate(parsedId.data, payload, { new: true, runValidators: true })
    : await Webinar.create(payload);
  if (!saved) return { ok: false, message: "The webinar could not be found." };
  revalidatePath("/"); revalidatePath("/administrator"); revalidatePath(`/webinars/${saved.slug}`);
  return { ok: true, message: "Webinar and registration form saved successfully.", id: String(saved._id), slug: saved.slug };
}

export async function deleteWebinarAction(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const validId = objectIdSchema.parse(id);
  await getDatabase();
  const webinar = await Webinar.findById(validId, { slug: 1 }).lean();
  if (!webinar) return;
  const registrationCount = await Registration.countDocuments({ webinarSlug: webinar.slug });
  if (registrationCount) throw new Error("Webinars with registrations cannot be deleted. Close or archive it instead.");
  await Webinar.findByIdAndDelete(validId);
  revalidatePath("/administrator"); revalidatePath("/");
}
