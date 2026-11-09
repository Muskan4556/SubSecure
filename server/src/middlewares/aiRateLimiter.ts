import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per IP (matches free-tier RPM)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests, please try again later." },
});

