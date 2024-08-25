import { PrismaClient, UserRole } from "@prisma/client";
// import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const createUser = async (data: any) => {
  // console.log(data);
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const userData = {
    name: data.name || "NO_NAME",
    email: data.email,
    // role: data.role.toUpperCase() as UserRole,
    password: hashedPassword,
  };

  const user = await prisma.user.create({ data: userData });

  return user;
};

const getAllUsers = async (data: any) => {
  const { limit = 10, page = 1 } = data;

  const result = await prisma.user.findMany({
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { createdAt: "desc" },
  });
  return result;
};

export const userService = { createUser, getAllUsers };
