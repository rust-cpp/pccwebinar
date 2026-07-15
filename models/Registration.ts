import { Schema, model, models } from "mongoose";

const RegistrationSchema = new Schema({
  webinarSlug: { type: String, required: true, index: true },
  fullName: { type: String, default: "", trim: true },
  ngoName: { type: String, default: "", trim: true },
  ngoType: { type: String, default: "", trim: true },
  pccRegistered: { type: Boolean, default: false },
  contactNumber: { type: String, default: "", trim: true },
  email: { type: String, default: "", trim: true, lowercase: true },
  seatConfirmed: { type: Boolean, default: true },
  attended: { type: Boolean, default: false },
  answers: { type: Map, of: Schema.Types.Mixed, default: {} },
  dedupeTokens: { type: [String], default: [] },
}, { timestamps: true });
RegistrationSchema.index({ webinarSlug: 1, contactNumber: 1 }, { unique: true, partialFilterExpression: { contactNumber: { $type: "string", $gt: "" } } });
RegistrationSchema.index({ webinarSlug: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string", $gt: "" } } });
RegistrationSchema.index({ dedupeTokens: 1 }, { unique: true, partialFilterExpression: { "dedupeTokens.0": { $exists: true } } });

export const Registration = models.Registration || model("Registration", RegistrationSchema);

const globalForIndexes = global as typeof globalThis & { registrationIndexes?: Promise<unknown> };
export function ensureRegistrationIndexes() {
  if (!globalForIndexes.registrationIndexes) globalForIndexes.registrationIndexes = Registration.syncIndexes().catch(error => { globalForIndexes.registrationIndexes = undefined; throw error; });
  return globalForIndexes.registrationIndexes;
}
