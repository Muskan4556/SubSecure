import { Request, Response } from "express";
import { updateMeSchema } from "../../validations/userValidation";
import prisma from "../../lib/prisma";

export const updateMe = async (req: Request, res: Response) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid input data",
      errors: parsed.error.issues,
    });
  }

  const { name } = parsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
