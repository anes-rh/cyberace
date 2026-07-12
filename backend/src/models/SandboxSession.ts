import { Schema, model, Document, Types } from "mongoose";

export type SandboxStatus = "starting" | "running" | "stopping" | "stopped" | "error";

export interface SandboxSessionDoc extends Document {
  user: Types.ObjectId;
  courseSlug: string;
  networkId: string;
  networkName: string;
  attackerContainerId: string;
  /** Optional: absent in single-container modules (no separate target). */
  targetContainerId?: string;
  terminalUrl: string;
  status: SandboxStatus;
  startedAt: Date;
  expiresAt: Date;
  errorMessage?: string;
}

const sandboxSessionSchema = new Schema<SandboxSessionDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseSlug: { type: String, required: true, index: true },
    networkId: { type: String, required: true },
    networkName: { type: String, required: true },
    attackerContainerId: { type: String, required: true },
    targetContainerId: { type: String, required: false },
    terminalUrl: { type: String, required: true },
    status: { type: String, enum: ["starting", "running", "stopping", "stopped", "error"], default: "starting" },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const SandboxSession = model<SandboxSessionDoc>("SandboxSession", sandboxSessionSchema);
