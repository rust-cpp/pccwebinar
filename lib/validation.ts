import { z } from "zod";
import { fieldTypes, type WebinarFormField } from "@/lib/form-types";

const keyPattern = /^[a-z][a-zA-Z0-9_]{1,39}$/;

export const formFieldSchema = z.object({
  id: z.string().min(2).max(80),
  key: z.string().regex(keyPattern, "Use a camelCase key beginning with a letter."),
  label: z.string().trim().min(2, "Field label is required.").max(100),
  type: z.enum(fieldTypes),
  required: z.boolean(),
  unique: z.boolean(),
  placeholder: z.string().max(120).optional().default(""),
  helpText: z.string().max(220).optional().default(""),
  options: z.array(z.string().trim().min(1).max(100)).max(30).optional().default([]),
  minLength: z.number().int().min(0).max(5000).optional(),
  maxLength: z.number().int().min(1).max(10000).optional(),
}).superRefine((field, context) => {
  if (["select", "radio"].includes(field.type) && field.options.length < 2) context.addIssue({ code: "custom", message: "Select and radio fields need at least two options.", path: ["options"] });
  if (field.minLength && field.maxLength && field.minLength > field.maxLength) context.addIssue({ code: "custom", message: "Minimum length cannot exceed maximum length.", path: ["minLength"] });
});

export const webinarEditorSchema = z.object({
  title: z.string().trim().min(5, "Title must contain at least 5 characters.").max(180),
  eyebrow: z.string().trim().min(2).max(100),
  heroTitle: z.string().trim().min(2).max(100),
  heroAccent: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  description: z.string().trim().min(10, "Add a short webinar description.").max(800),
  date: z.string().min(1, "Date and time are required.").refine(value => !Number.isNaN(new Date(value).getTime()), "Enter a valid date and time."),
  venue: z.string().trim().min(2).max(150),
  capacity: z.coerce.number().int().min(1).max(100000),
  status: z.enum(["draft", "open", "closed", "completed"]),
  recurringWeekly: z.boolean(),
  recurrenceWeekday: z.number().int().min(0).max(6),
  recurrenceTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid 24-hour time."),
  whatsappChannel: z.union([z.literal(""), z.url()]).optional().default(""),
  confirmationMessage: z.string().trim().min(5).max(300),
  closedMessage: z.string().trim().min(5).max(300),
  formFields: z.array(formFieldSchema).min(1, "Add at least one form field.").max(40),
}).superRefine((webinar, context) => {
  const keys = webinar.formFields.map(field => field.key);
  keys.forEach((key, index) => { if (keys.indexOf(key) !== index) context.addIssue({ code: "custom", message: `Duplicate field key: ${key}`, path: ["formFields", index, "key"] }); });
});

export type WebinarEditorInput = z.infer<typeof webinarEditorSchema>;

export function normalizeFieldValue(field: WebinarFormField, value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (field.type === "email") return raw.toLowerCase();
  if (field.type === "tel") return raw.replace(/[^0-9+]/g, "");
  return raw;
}

export function validateDynamicAnswers(fields: WebinarFormField[], rawAnswers: Record<string, unknown>) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) {
    let schema = z.string();
    if (field.required) schema = schema.min(1, `${field.label} is required.`);
    if (field.minLength) schema = schema.refine(value => !value || value.length >= field.minLength!, `${field.label} must contain at least ${field.minLength} characters.`);
    if (field.maxLength) schema = schema.refine(value => !value || value.length <= field.maxLength!, `${field.label} cannot exceed ${field.maxLength} characters.`);
    if (field.type === "email") schema = schema.refine(value => !value || z.email().safeParse(value).success, "Enter a valid email address.");
    if (field.type === "tel") schema = schema.refine(value => !value || /^\+?[0-9]{10,15}$/.test(value), "Enter a valid phone number with 10 to 15 digits.");
    if (field.type === "number") schema = schema.refine(value => !value || /^-?\d+(\.\d+)?$/.test(value), "Enter a valid number.");
    if (["select", "radio"].includes(field.type)) schema = schema.refine(value => !value || (field.options || []).includes(value), `Select a valid ${field.label.toLowerCase()} option.`);
    shape[field.key] = field.required ? schema : schema.optional().default("");
  }
  const normalized = Object.fromEntries(fields.map(field => [field.key, normalizeFieldValue(field, rawAnswers[field.key])]));
  return z.object(shape).safeParse(normalized);
}
