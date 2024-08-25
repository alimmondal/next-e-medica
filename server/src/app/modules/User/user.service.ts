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

export const userService = { createUser };
