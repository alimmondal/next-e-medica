import express, { Application, Request, Response } from "express";
import { userController } from "./user.controller";
import { PrismaClient, UserRole } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();
router.post("/signUp", userController.createUser);

router.get("/", userController.getAllUsers);

export const UserRoutes = router;
