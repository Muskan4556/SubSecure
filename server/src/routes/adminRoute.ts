import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";
import { Role } from "@prisma/client";
import {
  getAuditLogs,
  getAnalytics,
  getUsers,
  suspendUser,
  unsuspendUser,
} from "../controllers/admin";

const router = Router();

router.use(requireAuth, requireRole(Role.ADMIN));

router.get("/audit-logs", getAuditLogs);
router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/unsuspend", unsuspendUser);

export default router;
