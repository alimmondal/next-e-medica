import express, { Application, Request, Response } from "express";
import { userController } from "./user.controller";

const router = express.Router();

// Signin user
router.post("/signUp", userController.createUser);
router.post("/signin", userController.signIn);

// Get
router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);

// delete
router.delete("/:id", userController.deleteUser);

// update
router.patch("/:id", userController.updateUser);
router.patch("/address/:id", userController.updateUserAddress);
router.patch("/payment-method/:id", userController.updatePaymentMethod);

export const UserRoutes = router;
