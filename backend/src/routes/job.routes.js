import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import Job from "../models/Job.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const jobs = await Job.find({ ownerId: req.user.sub }).sort({ createdAt: -1 });
  res.json(jobs);
});

router.post("/", requireAuth, async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    company: z.string().optional(),
    location: z.string().optional(),
    description: z.string().min(20),
    mustHaveSkills: z.array(z.string()).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const job = await Job.create({ ownerId: req.user.sub, ...parsed.data });
  res.json(job);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await Job.deleteOne({ _id: req.params.id, ownerId: req.user.sub });
  res.json({ ok: true });
});

export default router;