import { Schema, model, models } from "mongoose";

const RateLimitSchema = new Schema({
  _id: { type: String, required: true },
  count: { type: Number, default: 0 },
  scope: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}, { versionKey: false, timestamps: true });

export const RateLimit = models.RateLimit || model("RateLimit", RateLimitSchema);
