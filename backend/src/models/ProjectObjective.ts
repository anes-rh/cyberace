import { Schema, model, Document } from "mongoose";
import type { ObjectiveKind, ProjectObjectiveValidation } from "../types";

/** Un objectif = l'équivalent d'un Challenge, mais pour les projets. */
export interface ProjectObjectiveDoc extends Document {
  id: string; // slug court (unique par projet)
  projectSlug: string;
  order: number;
  kind: ObjectiveKind;
  title: string;
  description: string;
  points: number;
  dependsOn: string[];
  /** JAMAIS sérialisé vers le client (select:false), comme Challenge.answer. */
  validation: ProjectObjectiveValidation;
}

const objectiveSchema = new Schema<ProjectObjectiveDoc>(
  {
    id: { type: String, required: true, index: true },
    projectSlug: { type: String, required: true, index: true },
    order: { type: Number, default: 0, index: true },
    kind: { type: String, enum: ["defense", "attack", "analysis"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    dependsOn: { type: [String], default: [] },
    // Bloc de vérification — non exposé : la validation se fait uniquement côté
    // serveur (sondes réseau réelles, requête WAF, comparaison de texte).
    validation: {
      type: new Schema(
        { strategy: { type: String, required: true }, spec: { type: Schema.Types.Mixed, default: {} } },
        { _id: false }
      ),
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Un id d'objectif est unique au sein d'un projet.
objectiveSchema.index({ projectSlug: 1, id: 1 }, { unique: true });

export const ProjectObjective = model<ProjectObjectiveDoc>("ProjectObjective", objectiveSchema);
