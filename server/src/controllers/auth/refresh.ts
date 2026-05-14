import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import { generateAccessToken } from "../../lib/token";

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    return res.status(200).json({ accessToken, user });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};
