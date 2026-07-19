import { Schema, model, Document, Types } from "mongoose";

/**
 * Journal d'audit des actions administrateur. Toute action DESTRUCTIVE
 * (changement de rôle, arrêt forcé de session, reset de progression) écrit une
 * entrée AVANT de confirmer la réponse au client — jamais en best-effort
 * silencieux après coup.
 */
export interface AdminAuditLogDoc extends Document {
  admin: Types.ObjectId; // qui a fait l'action
  action: string; // ex. "session.force_stop", "user.role_change", "user.progress_reset"
  targetType: string; // "user" | "sandboxSession" | "projectSession"
  targetId: string;
  details?: Record<string, unknown>;
  at: Date;
}

const adminAuditLogSchema = new Schema<AdminAuditLogDoc>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    at: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

export const AdminAuditLog = model<AdminAuditLogDoc>("AdminAuditLog", adminAuditLogSchema);
