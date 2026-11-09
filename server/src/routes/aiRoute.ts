import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { aiRateLimiter } from "../middlewares/aiRateLimiter";
import { getInsightsController } from "../controllers/ai/getInsights";
import { refreshInsightsController } from "../controllers/ai/refreshInsights";

const router = Router();

router.get("/insights", aiRateLimiter, requireAuth, getInsightsController);
router.post("/insights/refresh", aiRateLimiter, requireAuth, refreshInsightsController);

export default router;

