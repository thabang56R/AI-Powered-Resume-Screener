import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true, index: true },

    score: { type: Number, required: true },
    status: { type: String, enum: ["new", "shortlisted", "interview", "rejected", "hired"], default: "new", index: true },
    notes: { type: String, default: "" },
    seniority: { type: String, default: "" },

    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],

    strengths: [{ type: String }],
    risks: [{ type: String }],
    improvements: [{ type: String }],

    evidence: [
  {
    skill: { type: String, required: true },
    snippets: [{ type: String }]
  }
],

    interviewQuestions: [{ type: String }],
    summary: { type: String, default: "" },

    raw: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.model("Evaluation", EvaluationSchema);