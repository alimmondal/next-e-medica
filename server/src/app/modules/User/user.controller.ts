import { Request, Response } from "express";
import { userService } from "./user.service";
import { PrismaClient, UserRole } from "@prisma/client";

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

export const userController = {
  createUser,
  getAllUsers,
};
