import { Schema, model, Document } from "mongoose";
import type { CheckpointStatus } from "../types";

export interface CheckpointDoc extends Document {
  slug: string;
  title: string;
  order: number;
  status: CheckpointStatus;
  icon: string;
  accent: string;
  description: string;
  tagline: string;
}

const checkpointSchema = new Schema<CheckpointDoc>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["empty", "active"], default: "empty" },
    icon: { type: String, required: true },
    accent: { type: String, required: true },
    description: { type: String, default: "" },
    tagline: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Checkpoint = model<CheckpointDoc>("Checkpoint", checkpointSchema);
