import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
import { requireRole } from "../middlewares/requireRole";
import {
  getSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  approveSubscription,
  cancelSubscription,
  scheduleCancel,
  undoScheduleCancel,
  deleteSubscription,
  getSubscriptionStats,
  getUpcomingRenewals,
  getPendingApprovals,
} from "../controllers/subscriptions";

const router = Router();

// Static path
router.get("/stats", requireAuth, getSubscriptionStats);
router.get("/renewals", requireAuth, getUpcomingRenewals);
router.get(
  "/approvals",
  requireAuth,
  requireRole(Role.ADMIN),
  getPendingApprovals,
);

// Collection
router.get("/", requireAuth, getSubscriptions); 

router.post(
  "/",
  requireAuth,
  requireRole(Role.ADMIN, Role.USER),
  createSubscription,
);

// Item
router.get("/:id", requireAuth, getSubscriptionById);
router.patch("/:id", requireAuth, updateSubscription);

// admin only: REQUESTED → ACTIVE
router.put(
  "/:id/approve",
  requireAuth,
  requireRole(Role.ADMIN),
  approveSubscription,
);

// user:  REQUESTED → CANCELLED  (withdraw own request)
// admin: any status → CANCELLED (force cancel)
router.put("/:id/cancel", requireAuth, cancelSubscription);

// user only: ACTIVE → CANCEL_SCHEDULED  (sets cancelAt = renewalDate)
router.put(
  "/:id/schedule-cancel",
  requireAuth,
  requireRole(Role.USER),
  scheduleCancel,
);

// user only: CANCEL_SCHEDULED → ACTIVE  (undo before renewalDate is reached)
router.put(
  "/:id/undo-cancel",
  requireAuth,
  requireRole(Role.USER),
  undoScheduleCancel,
);

// admin only: hard delete
router.delete("/:id", requireAuth, requireRole(Role.ADMIN), deleteSubscription);

export default router;
