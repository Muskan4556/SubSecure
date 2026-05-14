import { Request, Response } from "express";

export const logout = (_: Request, res: Response) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.sendStatus(204);
};
