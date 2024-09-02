import express, { Application, Request, Response } from "express";
import { userController } from "./user.controller";
import { PrismaClient, UserRole } from "@prisma/client";

const router = express.Router();

router.post("/signUp", userController.createUser);
router.post("/signin", userController.signIn);

// Get
router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);

// delete
router.delete("/:id", userController.deleteUser);

// update
router.patch("/user", userController.updateUser);
router.patch("/address", userController.updateUserAddress);
router.patch("/payment-method", userController.updateUserPaymentMethod);

export const UserRoutes = router;
