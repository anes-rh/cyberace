import { Schema, model, Document, Types } from "mongoose";
import type { SandboxStatus } from "./SandboxSession";

/**
 * Session d'un projet = généralisation de SandboxSession : plusieurs réseaux,
 * plusieurs conteneurs, plusieurs terminaux (un par nœud `terminal:true`).
 */
export interface ProjectSessionDoc extends Document {
  user: Types.ObjectId;
  projectSlug: string;
  networkIds: { name: string; dockerId: string }[];
  containerIds: { nodeId: string; dockerId: string }[];
  terminalUrls: { nodeId: string; url: string }[];
  status: SandboxStatus;
  startedAt: Date;
  expiresAt: Date;
  errorMessage?: string;
}

const projectSessionSchema = new Schema<ProjectSessionDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectSlug: { type: String, required: true, index: true },
    networkIds: { type: [{ _id: false, name: String, dockerId: String }], default: [] },
    containerIds: { type: [{ _id: false, nodeId: String, dockerId: String }], default: [] },
    terminalUrls: { type: [{ _id: false, nodeId: String, url: String }], default: [] },
    status: { type: String, enum: ["starting", "running", "stopping", "stopped", "error"], default: "starting" },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const ProjectSession = model<ProjectSessionDoc>("ProjectSession", projectSessionSchema);
