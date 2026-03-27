import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

// Express middleware normally does not accept extra arguments.
// Express only calls middleware with (req, res, next), so if we want configurable middleware (like roles), we must wrap it in another function that receives those parameters first.
