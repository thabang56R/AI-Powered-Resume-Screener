// src/models/Screening.js
import mongoose from 'mongoose';

const screeningSchema = new mongoose.Schema(
  {
    matchPercentage: {
      type: Number,
      required: [true, 'Match percentage is required'],
      min: [0, 'Match percentage cannot be below 0'],
      max: [100, 'Match percentage cannot exceed 100'],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    skillsMatch: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },

    feedback: {
      type: String,
      required: [true, 'Feedback from AI analysis is required'],
      trim: true,
      minlength: [50, 'Feedback should be at least 50 characters'],
    },

    // Optional but useful additions
    jobDescriptionHash: {
      type: String,
      index: true, // for faster lookups if you ever deduplicate
      sparse: true,
    },

    resumeFileName: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

// Optional: Virtual for formatted match percentage
screeningSchema.virtual('matchScore').get(function () {
  return `${this.matchPercentage}%`;
});

// Optional: Index for frequent queries (e.g. recent screenings)
screeningSchema.index({ createdAt: -1 });

// Optional: Pre-save hook example (if you want to clean/normalize data)
screeningSchema.pre('save', function (next) {
  // Example: ensure feedback is trimmed
  if (this.feedback) {
    this.feedback = this.feedback.trim();
  }
  next();
});

export default mongoose.model('Screening', screeningSchema);