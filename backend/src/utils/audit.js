import AuditEvent from "../models/AuditEvent.js";

export async function logAudit({
  ownerId,
  actor,
  entityType,
  entityId,
  action,
  message = "",
  before = {},
  after = {},
  req
}) {
  const ip =
    req?.headers?.["x-forwarded-for"]?.toString()?.split(",")?.[0]?.trim() ||
    req?.ip ||
    "";

  const userAgent = req?.headers?.["user-agent"]?.toString() || "";

  return AuditEvent.create({
    ownerId,
    actor: {
      userId: actor.userId,
      email: actor.email || "",
      role: actor.role || ""
    },
    entityType,
    entityId,
    action,
    message,
    ip,
    userAgent,
    changes: { before, after }
  });
}