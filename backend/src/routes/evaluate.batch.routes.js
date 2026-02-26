import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import Evaluation from "../models/Evaluation.js";
import { evaluateResumeAgainstJob } from "../ai/evaluate.js";

const router = Router();

/**
 * POST /api/evaluate/batch
 * Body: { jobId: string, resumeIds: string[], max?: number }
 */
router.post("/batch", requireAuth, rateLimit, async (req, res) => {
  const schema = z.object({
    jobId: z.string().min(1),
    resumeIds: z.array(z.string().min(1)).min(1).max(50),
    max: z.number().int().min(1).max(20).optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { jobId, resumeIds, max } = parsed.data;
  const limit = max ?? 10;

  try {
    const job = await Job.findOne({ _id: jobId, ownerId: req.user.sub });
    if (!job) return res.status(404).json({ error: "Job not found" });

    // load resumes owned by user
    const resumes = await Resume.find({ _id: { $in: resumeIds }, ownerId: req.user.sub });
    if (!resumes.length) return res.status(404).json({ error: "No resumes found" });

    // Evaluate sequentially (safe) - later we can add concurrency=2
    const results = [];
    for (const r of resumes.slice(0, limit)) {
      // Skip if already evaluated for this job+resume (optional optimization)
      const existing = await Evaluation.findOne({ ownerId: req.user.sub, jobId, resumeId: r._id });
      if (existing) {
        results.push(existing);
        continue;
      }

      try {
        const { parsed: ai, raw } = await evaluateResumeAgainstJob({ resumeText: r.text, job });

        const doc = await Evaluation.create({
          ownerId: req.user.sub,
          jobId,
          resumeId: r._id,
          score: ai?.score ?? 0,
          seniority: ai?.seniority ?? "unclear",
          matchedSkills: ai?.matchedSkills ?? [],
          missingSkills: ai?.missingSkills ?? [],
          strengths: ai?.strengths ?? [],
          risks: ai?.risks ?? [],
          improvements: ai?.improvements ?? [],
          interviewQuestions: ai?.interviewQuestions ?? [],
          summary: ai?.summary ?? "",
          status: "new",
          notes: "",
          raw
        });

        results.push(doc);
      } catch (err) {
        // If one resume fails, don’t fail the whole batch
        results.push({
          resumeId: r._id,
          error: err?.message || "Evaluation failed"
        });
      }
    }

    return res.json({
      ok: true,
      count: results.length,
      results
    });
  } catch (err) {
    return res.status(500).json({ error: "Batch evaluation failed", details: err?.message });
  }
});

export default router;