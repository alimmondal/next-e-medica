import express, { Application, Request, Response } from "express";
import { userController } from "./user.controller";
import { PrismaClient, UserRole } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();
router.post("/", userController.createUser);
router.get("/", async (req: Request, res: Response) => {
  const result = await prisma.user.findMany();
  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

export const UserRoutes = router;
