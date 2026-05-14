import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
import { requireRole } from "../middlewares/requireRole";
import {
  getSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  scheduleCancel,
  undoScheduleCancel,
  deleteSubscription,
  getSubscriptionStats,
  getUpcomingRenewals,
} from "../controllers/subscriptions";

const router = Router();

// Static paths
router.get("/stats", requireAuth, getSubscriptionStats);
router.get("/renewals", requireAuth, getUpcomingRenewals);

// Collection
router.get("/", requireAuth, getSubscriptions); 

router.post(
  "/",
  requireAuth,
  createSubscription,
);

// Item
router.get("/:id", requireAuth, getSubscriptionById);
router.patch("/:id", requireAuth, updateSubscription);

// user: ACTIVE / CANCEL_SCHEDULED → CANCELLED
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
