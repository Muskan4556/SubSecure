import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const generateRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });