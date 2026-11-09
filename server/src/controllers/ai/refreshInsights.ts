import { Request, Response } from "express";
import { refreshInsights } from "../../lib/ai/insightService";

export const refreshInsightsController = async (req: Request, res: Response) => {
  try {
    const result = await refreshInsights(req.userId);
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("[POST /api/ai/insights/refresh]", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
