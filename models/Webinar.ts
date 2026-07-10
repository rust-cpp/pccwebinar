import { Schema, model, models } from "mongoose";

const WebinarSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  date: { type: Date, required: true },
  venue: { type: String, default: "Online session" },
  capacity: { type: Number, default: 250 },
  status: { type: String, enum: ["draft", "open", "closed", "completed"], default: "open" },
}, { timestamps: true });

export const Webinar = models.Webinar || model("Webinar", WebinarSchema);
