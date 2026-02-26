import mongoose from "mongoose";

const AuditEventSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    actor: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      email: { type: String, default: "" },
      role: { type: String, default: "" }
    },

    entityType: { type: String, required: true, index: true }, // e.g. "evaluation"
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    action: { type: String, required: true, index: true }, // e.g. "evaluation.updated"
    message: { type: String, default: "" },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },

    // store a small “diff”
    changes: {
      before: { type: Object, default: {} },
      after: { type: Object, default: {} }
    }
  },
  { timestamps: true }
);

export default mongoose.model("AuditEvent", AuditEventSchema);