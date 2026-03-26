import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AccessTokenPayload } from "../lib/token";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as unknown as AccessTokenPayload;

    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
