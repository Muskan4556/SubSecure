import { CookieOptions, Request, Response } from "express";
import { SignupSchema } from "../../validations/authValidation";
import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import { generateAccessToken, generateRefreshToken } from "../../lib/token";
import { refreshCookieOptions } from "../../lib/cookies";

export const signup = async (req: Request, res: Response) => {
  try {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: parsedData.error.issues,
      });
    }

    const { name, email, password } = parsedData.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, passwordHash: hashedPassword },
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

    const accessToken = generateAccessToken({ userId: newUser.id, role: newUser.role });
    const refreshToken = generateRefreshToken({ userId: newUser.id });

    res.cookie("refreshToken", refreshToken, refreshCookieOptions as CookieOptions);
    return res.status(201).json({ accessToken, user: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
