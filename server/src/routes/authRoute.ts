import express from "express";
import { signin, signup, refresh, logout } from "../controllers/auth";
import { authRateLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/signup", authRateLimiter, signup);
router.post("/signin", authRateLimiter, signin);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
