import mongoose from "mongoose";

const globalForMongoose = global as typeof globalThis & { mongoosePromise?: Promise<typeof mongoose> };

export function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(uri).catch((error) => {
      globalForMongoose.mongoosePromise = undefined;
      throw error;
    });
  }
  return globalForMongoose.mongoosePromise;
}
