import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export type AccessTokenPayload = {
  userId: string;
  role: Role;
};

export const generateAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const generateRefreshToken = (payload: { userId: string }) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });