import { Schema, model, Document } from "mongoose";
import type { Difficulty, ProjectTopology } from "../types";

/** Un projet = un scénario complet (topologie multi-nœuds + objectifs). */
export interface ProjectDoc extends Document {
  slug: string;
  checkpoint: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  topology: ProjectTopology;
  ttlSec: number;
}

const topologySchema = new Schema<ProjectTopology>(
  {
    networks: {
      type: [{ _id: false, name: String, cidr: String, internal: Boolean }],
      default: [],
    },
    nodes: {
      type: [
        {
          _id: false,
          id: String,
          image: String,
          role: { type: String, enum: ["attacker", "firewall", "waf", "target", "database"] },
          capAdd: { type: [String], default: [] },
          sysctls: { type: Schema.Types.Mixed, default: {} },
          terminal: { type: Boolean, default: false },
          networks: { type: [{ _id: false, name: String, ip: String }], default: [] },
          postStartRoutes: { type: [{ _id: false, network: String, viaIp: String }], default: [] },
          ports: { type: [{ _id: false, containerPort: Number, label: String, kind: String }], default: [] },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const projectSchema = new Schema<ProjectDoc>(
  {
    slug: { type: String, required: true, unique: true },
    checkpoint: { type: String, default: "cybersecurite-projets", index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard", "insane"], required: true },
    estimatedMinutes: { type: Number, default: 60 },
    topology: { type: topologySchema, required: true },
    ttlSec: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Project = model<ProjectDoc>("Project", projectSchema);
