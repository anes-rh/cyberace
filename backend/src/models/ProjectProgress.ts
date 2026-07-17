import { Schema, model, Document, Types } from "mongoose";
import type { ObjectiveKind } from "../types";

/** Progression d'un utilisateur sur un projet (parallèle à Progress). */
export interface ProjectProgressDoc extends Document {
  user: Types.ObjectId;
  projectSlug: string;
  completedObjectives: { objectiveId: string; kind: ObjectiveKind; completedAt: Date; points: number }[];
  status: "in_progress" | "completed";
  totalPoints: number;
  /** Passé à true par le reaper quand la session expire sans complétion : donne
   *  accès au corrigé même si le projet n'a pas été terminé. */
  solutionRevealed: boolean;
}

const projectProgressSchema = new Schema<ProjectProgressDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectSlug: { type: String, required: true, index: true },
    completedObjectives: {
      type: [
        {
          _id: false,
          objectiveId: String,
          kind: { type: String, enum: ["defense", "attack", "analysis"] },
          completedAt: { type: Date, default: Date.now },
          points: Number,
        },
      ],
      default: [],
    },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    totalPoints: { type: Number, default: 0 },
    solutionRevealed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Une seule ligne de progression par (user, projet).
projectProgressSchema.index({ user: 1, projectSlug: 1 }, { unique: true });

export const ProjectProgress = model<ProjectProgressDoc>("ProjectProgress", projectProgressSchema);
