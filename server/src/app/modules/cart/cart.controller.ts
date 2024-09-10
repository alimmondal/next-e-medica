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
// Get Cart
const getMyCart = async (req: Request, res: Response) => {
  try {
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    res.json(cart || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve cart" });
  }
};

// Add Item to Cart

const addItemToCart = async (req: Request, res: Response) => {
  try {
    const { productId, qty } = req.body; // Extract productId and qty from request body
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    if (!productId || !qty) {
      return res
        .status(400)
        .json({ error: "Product ID and quantity are required" });
    }

    // Find the product in the database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the cart by userId or sessionCartId
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    // Handle the case where cart or cart.items is null or not an array
    if (!cart || !Array.isArray(cart.items)) {
      throw new Error("Cart not found or items are not in the correct format.");
    }

    // Cast cart.items to the expected structure (array of objects with productId and qty)
    const cartItems = cart.items as { productId: string; qty: number }[];

    let updatedCart;

    if (!cart || !Array.isArray(cart.items)) {
      // If no cart exists, create a new cart with the item

      const items = [{ productId, qty }]; // Add item with productId and qty

      if (product.stock < qty) {
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock" });
      }
      updatedCart = await prisma.cart.create({
        data: {
          userId,
          sessionCartId,
          items: items, // Save items as JSON
          ...calcPrice(items),
        },
      });
    } else {
      // If cart exists, update the items array
      // const cartItems = cart.items as { productId: string; qty: number }[];

      const existItem = cartItems.find(
        (item: any) => item.productId === productId
      );

      if (existItem) {
        // If item already exists, increase the quantity
        if (product.stock < existItem.qty + qty) {
          return res
            .status(400)
            .json({ success: false, message: "Not enough stock" });
        }
        existItem.qty += qty;
      } else {
        // If item doesn't exist, add a new item
        cart.items.push({ productId, qty });
      }

      updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items, // Update items array
          ...calcPrice(cart.items), // Recalculate the prices
        },
      });
    }

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Remove Item from Cart
const removeItemFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    if (!cart || !Array.isArray(cart.items))
      return res.status(404).json({ error: "Cart not found" });

    const existItem = cart.items.find(
      (item: any) => item.productId === productId
    );

    if (!existItem)
      return res.status(404).json({ error: "Item not found in cart" });

    cart.items = cart.items.filter((item: any) => item.productId !== productId);

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items),
      },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const productController = {
  getMyCart,
  addItemToCart,
  removeItemFromCart,
};
