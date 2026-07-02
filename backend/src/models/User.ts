import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface SolvedEntry {
  challengeId: string;
  courseSlug: string;
  points: number;
  timeMs: number;
  hintsUsed: number;
  at: Date;
}

export interface UnlockedHints {
  challengeId: string;
  indexes: number[];
}

export interface UserDoc extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarSeed: string;
  title: string;
  xp: number;
  solved: SolvedEntry[];
  badges: string[];
  unlockedHints: UnlockedHints[];
  streak: number;
  lastActive: Date;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const solvedSchema = new Schema<SolvedEntry>(
  {
    challengeId: { type: String, required: true },
    courseSlug: { type: String, required: true },
    points: { type: Number, required: true },
    timeMs: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const unlockedHintsSchema = new Schema<UnlockedHints>(
  {
    challengeId: { type: String, required: true },
    indexes: { type: [Number], default: [] },
  },
  { _id: false }
);

const userSchema = new Schema<UserDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 40 },
    avatarSeed: { type: String, default: () => Math.random().toString(36).slice(2, 10) },
    title: { type: String, default: "Recrue" },
    xp: { type: Number, default: 0, index: true },
    solved: { type: [solvedSchema], default: [] },
    badges: { type: [String], default: [] },
    unlockedHints: { type: [unlockedHintsSchema], default: [] },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = model<UserDoc>("User", userSchema);
