import { CookieOptions, Request, Response } from "express";
import { SigninSchema, SignupSchema } from "../validations/auth";
import jwt from "jsonwebtoken";
import bycrpt from "bcrypt";
import prisma from "../lib/prisma";
import { generateAccessToken, generateRefreshToken } from "../lib/token";
import { refreshCookieOptions } from "../lib/cookies";

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

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordMatches = await bycrpt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions as CookieOptions,
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ accessToken: accessToken, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.json({
      message: "Internal Server Error",
    });
  }
};

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

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bycrpt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: hashedPassword,
      },
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

    const accessToken = generateAccessToken({ userId: newUser.id });
    const refreshToken = generateRefreshToken({ userId: newUser.id });
    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions as CookieOptions,
    );
    return res.json({ accessToken: accessToken, user: newUser });
  } catch (err) {
    console.error(err);
    return res.json({
      message: "Internal Server Error",
    });
  }
};

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
      select: { id: true, email: true, name: true, role: true, isActive: true, profileImageUrl: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const accessToken = generateAccessToken({ userId: payload.userId });
    return res.json({ accessToken, user });
  } catch(err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


export const logout = (_: Request, res: Response) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.sendStatus(204);
};
