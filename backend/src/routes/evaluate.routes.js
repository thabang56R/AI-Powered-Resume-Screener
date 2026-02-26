import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";

import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import Evaluation from "../models/Evaluation.js";
import { evaluateResumeAgainstJob } from "../ai/evaluate.js";
import { logAudit } from "../utils/audit.js";

const router = Router();

/**
 * POST /api/evaluate
 */
router.post("/", requireAuth, rateLimit, async (req, res) => {
  const schema = z.object({
    jobId: z.string().min(1),
    resumeId: z.string().min(1)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { jobId, resumeId } = parsed.data;

  try {
    const job = await Job.findOne({ _id: jobId, ownerId: req.user.sub });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const resume = await Resume.findOne({ _id: resumeId, ownerId: req.user.sub });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    const { parsed: ai, raw } = await evaluateResumeAgainstJob({
      resumeText: resume.text,
      job
    });

    const doc = await Evaluation.create({
      ownerId: req.user.sub,
      jobId,
      resumeId,
      score: ai?.score ?? 0,
      seniority: ai?.seniority ?? "unclear",
      matchedSkills: ai?.matchedSkills ?? [],
      missingSkills: ai?.missingSkills ?? [],
      evidence: ai?.evidence ?? [],
      strengths: ai?.strengths ?? [],
      risks: ai?.risks ?? [],
      improvements: ai?.improvements ?? [],
      interviewQuestions: ai?.interviewQuestions ?? [],
      summary: ai?.summary ?? "",
      status: "new",
      notes: "",
      raw
    });

    // Optional: audit that an evaluation was created
    await logAudit({
      ownerId: req.user.sub,
      actor: { userId: req.user.sub, email: req.user.email, role: req.user.role },
      entityType: "evaluation",
      entityId: doc._id,
      action: "evaluation.created",
      message: "Evaluation created",
      before: {},
      after: { score: doc.score, status: doc.status },
      req
    });

    return res.json(doc);
  } catch (err) {
    const message = err?.message || err?.error?.message || "AI evaluation failed";
    const status =
      err?.status === 429 || err?.code === "insufficient_quota" || /quota|429/i.test(message)
        ? 402
        : 500;

    return res.status(status).json({
      error: message,
      hint:
        status === 402
          ? "Your OpenAI API key/project has no remaining quota or billing is not enabled. Check usage/limits on the OpenAI Platform."
          : "Check backend logs for details."
    });
  }
});

/**
 * GET /api/evaluate
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const items = await Evaluation.find({ ownerId: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(items);
  } catch {
    return res.status(500).json({ error: "Failed to load evaluations" });
  }
});

/**
 * GET /api/evaluate/:id
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const item = await Evaluation.findOne({ _id: req.params.id, ownerId: req.user.sub });
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch {
    return res.status(500).json({ error: "Failed to load evaluation" });
  }
});

/**
 * PATCH /api/evaluate/:id
 * Update status and/or notes (Recruiter Panel) + write AuditEvent
 */
router.patch("/:id", requireAuth, async (req, res) => {
  const schema = z.object({
    status: z.enum(["new", "shortlisted", "interview", "rejected", "hired"]).optional(),
    notes: z.string().max(5000).optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const patch = parsed.data;

  try {
    const existing = await Evaluation.findOne({ _id: req.params.id, ownerId: req.user.sub });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const before = {
      status: existing.status,
      notes: existing.notes
    };

    // only log actual changes
    const after = {
      status: patch.status ?? existing.status,
      notes: patch.notes ?? existing.notes
    };

    const changed =
      before.status !== after.status || before.notes !== after.notes;

    const updated = await Evaluation.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.sub },
      { $set: patch },
      { new: true }
    );

    if (changed) {
      await logAudit({
        ownerId: req.user.sub,
        actor: { userId: req.user.sub, email: req.user.email, role: req.user.role },
        entityType: "evaluation",
        entityId: updated._id,
        action: "evaluation.updated",
        message:
          before.status !== after.status
            ? `Status changed: ${before.status} → ${after.status}`
            : "Notes updated",
        before,
        after,
        req
      });
    }

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update evaluation" });
  }
});

export default router;