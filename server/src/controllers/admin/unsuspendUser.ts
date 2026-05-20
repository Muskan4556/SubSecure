import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { UserStatus } from "@prisma/client";

export const unsuspendUser = async (req: Request, res: Response) => {
  const id = req.params.id as string | undefined;

  if (!id) return res.status(400).json({ message: "User ID is required" });

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.id === req.userId) {
      return res.status(403).json({ message: "You cannot unsuspend your own account" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({ message: "Admin accounts cannot be modified this way" });
    }

    if (user.status === UserStatus.ACTIVE) {
      return res.status(400).json({ message: "User is already active" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { status: UserStatus.ACTIVE },
        select: { id: true, name: true, email: true, role: true, status: true },
      });

      await tx.auditLog.create({
        data: {
          userId: req.userId,
          action: "ACCOUNT_UNSUSPENDED",
          entityType: "USER",
          entityId: id,
          ipAddress: req.ip ?? null,
        },
      });

      return updatedUser;
    });

    return res.status(200).json({ message: "User unsuspended successfully", data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
