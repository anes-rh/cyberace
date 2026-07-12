import { Schema, model, Document } from "mongoose";
import type { BadgeSeed, CourseResource, CourseVideo, Difficulty, SandboxConfig } from "../types";

export interface CourseDoc extends Document {
  slug: string;
  title: string;
  checkpoint: string;
  codename: string;
  domain: string;
  theme: string;
  icon: string;
  accent: string;
  order: number;
  difficulty: Difficulty;
  summary: string;
  objectives: string[];
  lesson: string;
  videos: CourseVideo[];
  resources: CourseResource[];
  sandbox?: SandboxConfig;
  badge: BadgeSeed;
}

const badgeSchema = new Schema<BadgeSeed>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const sandboxSchema = new Schema<SandboxConfig>(
  {
    attackerImage: { type: String, required: true },
    targetImage: { type: String, required: true },
    ttlSec: { type: Number, required: true },
    attackerCapAdd: { type: [String], default: [] },
    ports: {
      type: [{ _id: false, containerPort: Number, label: String }],
      default: [],
    },
    network: {
      type: { _id: false, subnet: String, gateway: String },
      required: false,
    },
    targetStaticIp: { type: String, required: false },
    attackerStaticIp: { type: String, required: false },
  },
  { _id: false }
);

const courseSchema = new Schema<CourseDoc>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    checkpoint: { type: String, default: "cybersecurite", index: true },
    codename: { type: String, required: true },
    domain: { type: String, required: true },
    theme: { type: String, required: true },
    icon: { type: String, required: true },
    accent: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "insane"],
      required: true,
    },
    summary: { type: String, required: true },
    objectives: { type: [String], default: [] },
    lesson: { type: String, required: true },
    videos: { type: [{ _id: false, title: String, youtubeId: String, moreUrl: String }], default: [] },
    resources: {
      type: [{ _id: false, label: String, url: String, kind: String, os: String, note: String }],
      default: [],
    },
    sandbox: { type: sandboxSchema, required: false },
    badge: { type: badgeSchema, required: true },
  },
  { timestamps: true }
);

export const Course = model<CourseDoc>("Course", courseSchema);
