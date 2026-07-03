import { Schema, model, Document } from "mongoose";
import type { ChallengeType, CodeLanguage, Difficulty, Hint } from "../types";

export interface ChallengeDoc extends Document {
  challengeId: string;
  courseSlug: string;
  title: string;
  order: number;
  difficulty: Difficulty;
  type: ChallengeType;
  prompt: string;
  points: number;
  timeLimitSec: number;
  hints: Hint[];
  options: string[];
  /** Server-only answer fields (never serialised — select:false). */
  answer: string | number | number[];
  accept: string[];
  caseSensitive: boolean;
  widget?: string;
  language?: CodeLanguage;
  starter?: string;
  expectedOutput?: string;
  explanation: string;
  tags: string[];
}

const hintSchema = new Schema<Hint>(
  {
    text: { type: String, required: true },
    cost: { type: Number, default: 25 },
  },
  { _id: false }
);

const challengeSchema = new Schema<ChallengeDoc>(
  {
    challengeId: { type: String, required: true, unique: true },
    courseSlug: { type: String, required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "insane"],
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "mcq", "multi", "numeric", "order", "code"],
      required: true,
    },
    prompt: { type: String, required: true },
    points: { type: Number, required: true },
    timeLimitSec: { type: Number, default: 300 },
    hints: { type: [hintSchema], default: [] },
    options: { type: [String], default: [] },
    // Sensitive fields: excluded from queries unless explicitly selected.
    answer: { type: Schema.Types.Mixed, required: true, select: false },
    accept: { type: [String], default: [], select: false },
    caseSensitive: { type: Boolean, default: false, select: false },
    widget: { type: String },
    language: { type: String, enum: ["pseudo", "c"] },
    starter: { type: String },
    expectedOutput: { type: String },
    explanation: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Challenge = model<ChallengeDoc>("Challenge", challengeSchema);
