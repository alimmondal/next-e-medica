import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../../shared/prisma";

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expireTime,
  });
};

// const verifyToken = (token: string, secret: Secret): JwtPayload => {
//   return jwt.verify(token, secret) as JwtPayload;
// };

export const jwtHelpers = {
  createToken,
  // verifyToken,
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("cookies", req.cookies);
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
