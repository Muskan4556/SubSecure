import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { ownershipCheck } from "../middlewares/ownershipCheck";
import {
  getSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  getSubscriptionStats,
  getUpcomingRenewals,
  getBillingHistory,
  getAllMyBillingHistory,
} from "../controllers/subscriptions";

const router = Router();

router.get("/stats", requireAuth, getSubscriptionStats);
router.get("/renewals", requireAuth, getUpcomingRenewals);
router.get("/billing-history", requireAuth, getAllMyBillingHistory);

router.post("/", requireAuth, createSubscription);
router.get("/", requireAuth, getSubscriptions);

router.get("/:id", requireAuth, ownershipCheck, getSubscriptionById);
router.patch("/:id", requireAuth, ownershipCheck, updateSubscription);
router.put("/:id/cancel", requireAuth, ownershipCheck, cancelSubscription);

router.get(
  "/:id/billing-history",
  requireAuth,
  ownershipCheck,
  getBillingHistory,
);

export default router;
