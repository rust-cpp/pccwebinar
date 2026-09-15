import { Schema, model, models } from "mongoose";

const FormFieldSchema = new Schema({
  id: { type: String, required: true },
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ["text", "email", "tel", "number", "textarea", "select", "radio", "checkbox"], required: true },
  required: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
  helpText: { type: String, default: "" },
  options: { type: [String], default: [] },
  minLength: Number,
  maxLength: Number,
}, { _id: false });

const WebinarSchema = new Schema({
  title: { type: String, required: true },
  eyebrow: { type: String, default: "NGO Training Programme" },
  heroTitle: { type: String, default: "Build stronger." },
  heroAccent: { type: String, default: "Serve better." },
  slug: { type: String, required: true, unique: true },
  description: String,
  date: { type: Date, required: true },
  venue: { type: String, default: "Online session" },
  capacity: { type: Number, default: 250 },
  status: { type: String, enum: ["draft", "open", "closed", "completed"], default: "open" },
  recurringWeekly: { type: Boolean, default: false },
  recurrenceWeekday: { type: Number, min: 0, max: 6, default: 4 },
  recurrenceTime: { type: String, default: "11:00" },
  whatsappChannel: { type: String, default: "" },
  confirmationMessage: { type: String, default: "Your registration is confirmed." },
  closedMessage: { type: String, default: "Registrations are closed. See you in the next webinar." },
  formFields: { type: [FormFieldSchema], default: [] },
}, { timestamps: true });

export const Webinar = models.Webinar || model("Webinar", WebinarSchema);
