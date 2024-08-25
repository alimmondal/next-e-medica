import { Request, Response } from "express";
import { userService } from "./user.service";

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

export const userController = {
  createUser,
};
