import { CookieOptions, Request, Response } from "express";
import { SigninSchema } from "../../validations/authValidation";
import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import { generateAccessToken, generateRefreshToken } from "../../lib/token";
import { refreshCookieOptions } from "../../lib/cookies";

export const signin = async (req: Request, res: Response) => {
  try {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsedData.error.issues,
      });
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions as CookieOptions);

    const { passwordHash: _, ...safeUser } = user;
    return res.status(200).json({ accessToken, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
