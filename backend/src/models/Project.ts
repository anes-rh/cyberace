import { Schema, model, Document } from "mongoose";
import type { Difficulty, ProjectTopology, ProjectSolution } from "../types";

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
  /** Corrigé — non exposé par défaut (select:false), servi par l'endpoint dédié. */
  solution: ProjectSolution;
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
          role: {
            type: String,
            enum: ["attacker", "firewall", "waf", "target", "database", "log", "directory", "pipeline", "registry", "cloud"],
          },
          capAdd: { type: [String], default: [] },
          privileged: { type: Boolean, default: false },
          sysctls: { type: Schema.Types.Mixed, default: {} },
          env: { type: Schema.Types.Mixed, default: {} },
          terminal: { type: Boolean, default: false },
          networks: { type: [{ _id: false, name: String, ip: String }], default: [] },
          postStartRoutes: { type: [{ _id: false, network: String, viaIp: String }], default: [] },
          ports: { type: [{ _id: false, containerPort: Number, label: String, kind: String }], default: [] },
          resources: { type: { _id: false, memMb: Number, cpu: Number }, default: undefined },
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
    // Corrigé complet : jamais renvoyé dans les listings (select:false) ; seul
    // l'endpoint /solution le sert, et uniquement si terminé ou temps écoulé.
    solution: {
      type: new Schema(
        {
          summary: String,
          steps: [
            {
              _id: false,
              objectiveId: String,
              explanation: String,
              commands: [String],
              expectedLogs: String,
            },
          ],
        },
        { _id: false }
      ),
      select: false,
      default: undefined,
    },
  },
  { timestamps: true }
);

export const Project = model<ProjectDoc>("Project", projectSchema);
