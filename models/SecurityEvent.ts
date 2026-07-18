import { Schema, model, models } from "mongoose";

const SecurityEventSchema = new Schema({
  type: { type: String, enum: ["rate_limited", "invalid_token", "invalid_login", "honeypot", "origin_mismatch", "validation_failed", "duplicate", "bulk_deleted"], required: true, index: true },
  webinarSlug: { type: String, default: "", index: true },
  occurrenceKey: { type: String, default: "" },
  ipHash: { type: String, default: "", index: true },
  detail: { type: String, default: "" },
  count: { type: Number, default: 1 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 180 * 86400000), index: { expireAfterSeconds: 0 } },
}, { timestamps: true });

export const SecurityEvent = models.SecurityEvent || model("SecurityEvent", SecurityEventSchema);
