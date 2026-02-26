import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Resume", ResumeSchema);