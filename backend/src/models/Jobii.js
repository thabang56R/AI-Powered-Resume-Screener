import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    description: { type: String, required: true },
    mustHaveSkills: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);