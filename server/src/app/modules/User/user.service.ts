import { PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../helpers/jwtHelper";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
const prisma = new PrismaClient();

// Create/ sign up and Sign in
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

const signInWithCredentials = async (data: any) => {
  const { email, password } = data;

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  let isUserExist;
  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  } else {
    isUserExist = user;
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Handle successful sign-in (e.g., set a session or return a JWT)

  const payloadData = {
    id: isUserExist!.id,
    email: isUserExist!.email,
    role: isUserExist!.role,
    // phoneNumber: isUserExist!.phoneNumber,
  };

  //   create access token
  const accessToken = jwtHelpers.createToken(
    payloadData,
    (config.jwt.secret as Secret) || "programminghero",
    (process.env.EXPIRES_IN as string) || "30d"
  );
  //   create refresh token
  const refreshToken = jwtHelpers.createToken(
    payloadData,
    (config.jwt.refresh_secret as Secret) || "programminghero",
    (config.jwt.refresh_expires_in as string) || "30d"
  );
  return { accessToken, refreshToken, user };
};

const getUserById = async (data: any) => {
  const user = await prisma.user.findUnique({
    where: { id: data },
  });

  if (!user) {
    throw new Error("User not found");
  }
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

const deleteUser = async (id: any): Promise<any> => {
  const res = await prisma.user.delete({
    where: { id: id },
  });
  return res;
};

const updateUser = async (id: string, userData: any): Promise<any> => {
  // const { role, name } = userData;

  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: userData,
    // data:{
    //   role: userData.role.toUpperCase() as UserRole,
    //   name: name
    // }
  });

  return updatedUser;
};

const updateUserAddress = async (id: string, data: any): Promise<any> => {
  const { address } = data;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      address,
    },
  });

  return updatedUser;
};

const updatePaymentMethod = async (id: string, data: User): Promise<any> => {
  const { paymentMethod } = data;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      paymentMethod,
    },
  });

  return updatedUser;
};

export const userService = {
  createUser,
  getAllUsers,
  signInWithCredentials,
  getUserById,
  deleteUser,
  updateUser,
  updateUserAddress,
  updatePaymentMethod,
};
