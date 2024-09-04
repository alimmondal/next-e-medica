import { Request, Response } from "express";
import { userService } from "./user.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createUser = async (req: Request, res: Response) => {
  //   const user = req.body;
  // console.log(req.body);
  try {
    const result = await userService.createUser(req.body);

    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2002" && error.meta.target.includes("email")) {
      res.status(409).json({ success: false, message: "Email already exists" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "An error occurred during sign-up" });
    }
  }
};

const signIn = async (req: Request, res: Response) => {
  //   const user = req.body;
  // console.log(req.body);
  try {
    const user = await userService.signInWithCredentials(req.body);

    res.status(200).json({
      success: true,
      message: "Sign in successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "An error occurred during sign-in",
    });
  }
};

// Get users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const users = await userService.getAllUsers(req.query);

    const totalUsers = await prisma.user.count();

    res.status(200).json({
      data: users,
      totalPages: Math.ceil(totalUsers / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users",
    });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user",
    });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.deleteUser(id);

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user",
    });
  }
};

// Update user
const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ...userData } = req.body;
  // console.log(userData);
  try {
    const updatedUser = await userService.updateUser(id, userData);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user",
    });
  }
};

const updateUserAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedUser = await userService.updateUserAddress(id, req.body);

    res.status(200).json({
      success: true,
      message: "User address updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the address",
    });
  }
};

const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedUser = await userService.updatePaymentMethod(id, req.body);

    res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the payment method",
    });
  }
};

export const userController = {
  createUser,
  signIn,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateUserAddress,
  updatePaymentMethod,
};
