import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import prisma from "./lib/prisma";
import authRoute from "./routes/authRoute";
import subscriptionRoute from "./routes/subscriptionsRoute";
import adminRoute from "./routes/adminRoute";
import userRoute from "./routes/users";
import { generalRateLimiter } from "./middlewares/rateLimiter";

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(generalRateLimiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(","),
    credentials: true,
  }),
);

// Routes
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "OK" });
  } catch {
    res.status(503).json({ status: "DB_DOWN" });
  }
});

app.use("/api/auth", authRoute);
app.use("/api/subscriptions", subscriptionRoute);
app.use("/api/admin", adminRoute);
app.use("/api/users", userRoute);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
