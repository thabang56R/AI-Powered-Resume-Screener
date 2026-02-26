import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import AuditEvent from "../models/AuditEvent.js";

const router = Router();

/**
 * GET /api/audit
 * Query:
 * - entityType=evaluation
 * - entityId=<id>
 * - limit=50
 */
router.get("/", requireAuth, async (req, res) => {
  const schema = z.object({
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    limit: z.string().optional()
  });

  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { entityType, entityId } = parsed.data;
  const limit = Math.min(100, Math.max(1, Number(parsed.data.limit || 50)));

  const filter = { ownerId: req.user.sub };
  if (entityType) filter.entityType = entityType;
  if (entityId) filter.entityId = entityId;

  const events = await AuditEvent.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(events);
});

export default router;