import { Schema, model, Document, Types } from "mongoose";

export interface AttemptDoc extends Document {
  user: Types.ObjectId;
  challengeId: string;
  courseSlug: string;
  correct: boolean;
  pointsAwarded: number;
  timeMs: number;
  hintsUsed: number;
  submitted: string;
  createdAt: Date;
}

const attemptSchema = new Schema<AttemptDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challengeId: { type: String, required: true, index: true },
    courseSlug: { type: String, required: true },
    correct: { type: Boolean, required: true },
    pointsAwarded: { type: Number, default: 0 },
    timeMs: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    submitted: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Attempt = model<AttemptDoc>("Attempt", attemptSchema);
