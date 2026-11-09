import { Request, Response } from "express";
import { getInsights } from "../../lib/ai/insightService";

export const getInsightsController = async (req: Request, res: Response) => {
  try {
    const result = await getInsights(req.userId);
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("[GET /api/ai/insights]", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

