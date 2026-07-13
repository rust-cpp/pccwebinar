"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { Webinar } from "@/models/Webinar";
import { currentWebinar } from "@/lib/webinar";
import { clearAdminSession, createAdminSession, isAdmin } from "@/lib/auth";

export type FormState = { ok: boolean; message: string };

export async function registerNgo(_: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const ngoName = String(formData.get("ngoName") || "").trim();
  const ngoType = String(formData.get("ngoType") || "").trim();
  const contactNumber = String(formData.get("contactNumber") || "").replace(/[^0-9+]/g, "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const pccValue = String(formData.get("pccRegistered") || "");
  if (fullName.length < 3 || ngoName.length < 2 || !/^\+?[0-9]{10,15}$/.test(contactNumber) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["yes", "no"].includes(pccValue))
    return { ok: false, message: "Please complete all required fields with a valid phone number and email." };
  try {
    await getDatabase();
    await Webinar.updateOne({ slug: currentWebinar.slug }, { $set: currentWebinar }, { upsert: true });
    const duplicate = await Registration.findOne({ webinarSlug: currentWebinar.slug, $or: [{ contactNumber }, { email }] }, { contactNumber: 1, email: 1 }).lean();
    if (duplicate?.contactNumber === contactNumber) return { ok: false, message: "This phone number is already registered for this webinar." };
    if (duplicate?.email === email) return { ok: false, message: "This email address is already registered for this webinar." };
    await Registration.create({ webinarSlug: currentWebinar.slug, fullName, ngoName, ngoType, contactNumber, email, pccRegistered: pccValue === "yes", seatConfirmed: true });
    revalidatePath("/administrator");
    return { ok: true, message: "Your seat is confirmed. We look forward to welcoming you!" };
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      const key = "keyPattern" in error ? error.keyPattern as Record<string, number> : {};
      return { ok: false, message: key.email ? "This email address is already registered for this webinar." : "This phone number is already registered for this webinar." };
    }
    return { ok: false, message: "Registration could not be saved. Please try again shortly." };
  }
}

export async function loginAdmin(_: FormState, formData: FormData): Promise<FormState> {
  if (!process.env.ADMIN_PASSWORD) return { ok: false, message: "ADMIN_PASSWORD is not configured." };
  if (String(formData.get("password")) !== process.env.ADMIN_PASSWORD) return { ok: false, message: "Incorrect password." };
  await createAdminSession(); redirect("/administrator");
}
export async function logoutAdmin() { await clearAdminSession(); redirect("/administrator/login"); }

export async function toggleAttendance(id: string, value: boolean) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await getDatabase(); await Registration.findByIdAndUpdate(id, { attended: value }); revalidatePath("/administrator");
}

export async function deleteRegistration(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  if (!/^[a-f\d]{24}$/i.test(id)) throw new Error("Invalid registration ID");
  await getDatabase();
  await Registration.findByIdAndDelete(id);
  revalidatePath("/administrator");
}

export async function createWebinarAction(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const title = String(formData.get("title") || "").trim();
  const date = new Date(String(formData.get("date") || ""));
  if (title.length < 5 || Number.isNaN(date.getTime())) return;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${date.toISOString().slice(0, 10)}`;
  await getDatabase();
  await Webinar.create({ title, slug, date, venue: String(formData.get("venue") || "Online webinar"), capacity: Number(formData.get("capacity")) || 250, status: "open" });
  revalidatePath("/administrator");
}
