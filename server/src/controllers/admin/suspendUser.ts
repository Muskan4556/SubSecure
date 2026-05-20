import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { UserStatus } from "@prisma/client";

export const suspendUser = async (req: Request, res: Response) => {
  const id = req.params.id as string | undefined;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.id === req.userId) {
      return res.status(403).json({ message: "You cannot suspend your own account" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({ message: "Admin accounts cannot be suspended" });
    }

    if (user.status === UserStatus.SUSPENDED) {
      return res.status(400).json({ message: "User is already suspended" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { status: UserStatus.SUSPENDED },
        select: { id: true, name: true, email: true, role: true, status: true },
      });

      await tx.auditLog.create({
        data: {
          userId: req.userId,
          action: "ACCOUNT_SUSPENDED",
          entityType: "USER",
          entityId: id,
          ipAddress: req.ip ?? null,
        },
      });

      return updatedUser;
    });

    return res.status(200).json({
      message: "User suspended successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
