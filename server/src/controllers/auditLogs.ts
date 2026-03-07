import { Request, Response } from "express";

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
