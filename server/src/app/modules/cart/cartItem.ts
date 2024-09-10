import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
import { productService } from "./cart.service";
import { userService } from "../User/user.service";
import { calcPrice } from "../../../utils/calcPrice";

const prisma = new PrismaClient();
type CartItem = {
  productId: string;
  qty: number;
};

export const addItemToCarts = async (req: Request, res: Response) => {
  try {
    const { productId, qty }: CartItem = req.body;

    // Ensure sessionCartId exists in the cookies
    const sessionCartId = req.cookies.sessionCartId;
    if (!sessionCartId) {
      return res
        .status(400)
        .json({ success: false, message: "Cart Session not found" });
    }

    // Ensure user session exists (auth middleware)
    // const session = await auth(req, res);
    const userId = req?.user?.id as string | undefined;

    // Fetch user's current cart
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    // Fetch product from the database
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (!cart || !Array.isArray(cart.items)) {
      // No existing cart, create a new cart
      if (product.stock < qty) {
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock" });
      }

      // Create a new cart with this item
      await prisma.cart.create({
        data: {
          userId,
          sessionCartId,
          items: [{ productId, qty }],
          ...calcPrice([{ productId, qty }]),
        },
      });

      return res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
      });
    } else {
      // Existing cart, update or add item
      const existItem = cart.items.find(
        (item: any) => item.productId === productId
      );

      if (existItem) {
        // If item exists, update quantity
        if (product.stock < existItem.qty + qty) {
          return res
            .status(400)
            .json({ success: false, message: "Not enough stock" });
        }

        // Update quantity of the existing item
        existItem.qty += qty;
      } else {
        // Add new item if it doesn't exist in the cart
        if (product.stock < qty) {
          return res
            .status(400)
            .json({ success: false, message: "Not enough stock" });
        }

        cart.items.push({ productId, qty });
      }

      // Update the cart in the database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items),
        },
      });

      return res.status(200).json({
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart successfully`,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};
