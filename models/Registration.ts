import { Schema, model, models } from "mongoose";

const RegistrationSchema = new Schema({
  webinarSlug: { type: String, required: true, index: true },
  fullName: { type: String, required: true, trim: true },
  ngoName: { type: String, required: true, trim: true },
  ngoType: { type: String, default: "", trim: true },
  pccRegistered: { type: Boolean, required: true },
  contactNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  seatConfirmed: { type: Boolean, default: true },
  attended: { type: Boolean, default: false },
}, { timestamps: true });
RegistrationSchema.index({ webinarSlug: 1, contactNumber: 1 }, { unique: true });
RegistrationSchema.index({ webinarSlug: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

export const Registration = models.Registration || model("Registration", RegistrationSchema);
