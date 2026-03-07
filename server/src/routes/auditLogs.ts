import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { Role } from "@prisma/client";
import { getAuditLogs } from "../controllers/auditLogs";

const router = Router();

// admin only: full audit trail
router.get("/", requireAuth, requireRole(Role.ADMIN), getAuditLogs);

export default router;
