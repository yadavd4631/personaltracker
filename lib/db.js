import mongoose from "mongoose";

// Next.js hot-reload me multiple connections na banein isliye global cache
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI set nahi hai — README ka 'MongoDB Atlas Setup' section dekho");
  }
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Sirf progress DB me jaata hai — 84-day plan static hai (data/plan.json)
const ProgressSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, unique: true, min: 1, max: 84 },
    done: { type: Boolean, default: false },
    doneAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Progress =
  mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
