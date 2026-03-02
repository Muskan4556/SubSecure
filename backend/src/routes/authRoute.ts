import express from "express";
import { signin, signup, refresh, logout } from "../controllers/authControllers";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refresh);
router.get("/refresh", refresh);
router.post("/logout", logout);

export default router;
